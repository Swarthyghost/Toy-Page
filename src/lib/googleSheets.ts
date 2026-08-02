import { google } from 'googleapis';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function getFallbackSheetId(): Promise<string> {
  try {
    const docRef = doc(db, 'settings', 'global');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().googleSheetId || '';
    }
  } catch (e) {
    console.error('Error fetching fallback sheet ID:', e);
  }
  return '';
}

async function getSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const spreadsheetId = process.env.GOOGLE_SHEET_ID || await getFallbackSheetId();

  if (!email || !privateKey || !spreadsheetId) {
    console.warn('Google Service Account details or Sheet ID missing.');
    return null;
  }

  // Format private key properly
  const formattedKey = privateKey.replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email,
    key: formattedKey,
    scopes: SCOPES,
  });

  return google.sheets({ version: 'v4', auth });
}

export async function getSheetValues(range: string): Promise<any[][] | null> {
  try {
    const sheets = await getSheetsClient();
    if (!sheets) return null;

    const spreadsheetId = process.env.GOOGLE_SHEET_ID || await getFallbackSheetId();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    return response.data.values || null;
  } catch (error) {
    console.error('Error reading from Google Sheet:', error);
    return null;
  }
}

export async function updateSheetValues(range: string, values: any[][]) {
  try {
    const sheets = await getSheetsClient();
    if (!sheets) return;

    const spreadsheetId = process.env.GOOGLE_SHEET_ID || await getFallbackSheetId();
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });
  } catch (error) {
    console.error('Error updating Google Sheet values:', error);
  }
}

export async function appendToSheet(range: string, values: any[][]) {
  try {
    const sheets = await getSheetsClient();
    if (!sheets) return;

    const spreadsheetId = process.env.GOOGLE_SHEET_ID || await getFallbackSheetId();
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });
  } catch (error) {
    console.error('Error appending rows to Google Sheet:', error);
  }
}

export async function clearSheet(range: string) {
  try {
    const sheets = await getSheetsClient();
    if (!sheets) return;

    const spreadsheetId = process.env.GOOGLE_SHEET_ID || await getFallbackSheetId();
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range,
    });
  } catch (error) {
    console.error('Error clearing Google Sheet range:', error);
  }
}
