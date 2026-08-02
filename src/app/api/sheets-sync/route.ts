import { NextRequest, NextResponse } from 'next/server';
import { appendToSheet, clearSheet } from '../../../lib/googleSheets';
import { db } from '../../../config/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { type, data } = await req.json();

    if (!type) {
      return NextResponse.json({ error: 'Missing sync type' }, { status: 400 });
    }

    if (type === 'sale') {
      const { id, productName, quantity, price, costPrice, profit, platform, paymentMethod, discount, deliveryFee, notes, createdAt } = data;
      await appendToSheet('Sales!A:L', [[
        id || '',
        createdAt || '',
        productName || '',
        quantity || 0,
        price || 0,
        costPrice || 0,
        profit || 0,
        platform || '',
        paymentMethod || '',
        discount || 0,
        deliveryFee || 0,
        notes || ''
      ]]);
    } else if (type === 'expense') {
      const { id, category, amount, description, createdAt } = data;
      await appendToSheet('Expenses!A:E', [[
        id || '',
        createdAt || '',
        category || '',
        amount || 0,
        description || ''
      ]]);
    } else if (type === 'inventory_log') {
      const { id, productId, productName, type: logType, changeQty, newQty, reason, createdAt } = data;
      await appendToSheet('InventoryLogs!A:H', [[
        id || '',
        createdAt || '',
        productId || '',
        productName || '',
        logType || '',
        changeQty || 0,
        newQty || 0,
        reason || ''
      ]]);
    } else if (type === 'bulk_sync') {
      // Bulk Sync Sales
      const salesSnap = await getDocs(query(collection(db, 'sales'), orderBy('createdAt', 'desc')));
      const salesValues = salesSnap.docs.map(doc => {
        const d = doc.data();
        return [
          doc.id,
          d.createdAt?.toDate().toISOString() || '',
          d.productName || '',
          d.quantity || 0,
          d.price || 0,
          d.costPrice || 0,
          d.profit || 0,
          d.platform || '',
          d.paymentMethod || '',
          d.discount || 0,
          d.deliveryFee || 0,
          d.notes || ''
        ];
      });
      await clearSheet('Sales!A2:L10000');
      if (salesValues.length > 0) {
        await appendToSheet('Sales!A2', salesValues);
      }

      // Bulk Sync Expenses
      const expensesSnap = await getDocs(query(collection(db, 'expenses'), orderBy('createdAt', 'desc')));
      const expensesValues = expensesSnap.docs.map(doc => {
        const d = doc.data();
        return [
          doc.id,
          d.createdAt?.toDate().toISOString() || '',
          d.category || '',
          d.amount || 0,
          d.description || ''
        ];
      });
      await clearSheet('Expenses!A2:E10000');
      if (expensesValues.length > 0) {
        await appendToSheet('Expenses!A2', expensesValues);
      }

      // Bulk Sync Products
      const productsSnap = await getDocs(query(collection(db, 'products'), orderBy('updatedAt', 'desc')));
      const productsValues = productsSnap.docs.map(doc => {
        const d = doc.data();
        return [
          doc.id,
          d.name || '',
          d.category || '',
          d.costPrice || 0,
          d.price || 0,
          d.currentStock || 0,
          d.minimumStock || 0,
          d.status || 'draft'
        ];
      });
      await clearSheet('Products!A2:H10000');
      if (productsValues.length > 0) {
        await appendToSheet('Products!A2', productsValues);
      }
    } else {
      return NextResponse.json({ error: 'Invalid sync type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in sheets-sync API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
