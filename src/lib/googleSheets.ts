import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

function getSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !privateKey || !spreadsheetId) {
    console.warn('Google Service Account details missing. Running sheets mock.');
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

export async function appendToSheet(range: string, values: any[][]) {
  try {
    const sheets = getSheetsClient();
    if (!sheets) return;

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
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
    const sheets = getSheetsClient();
    if (!sheets) return;

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range,
    });
  } catch (error) {
    console.error('Error clearing Google Sheet range:', error);
  }
}
