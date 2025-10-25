import { getGoogleDriveClient, getGoogleSheetsClient } from './google-clients';
import { Readable } from 'stream';

export async function createCustomerFolder(customerName: string, customerId: string): Promise<string> {
  const drive = await getGoogleDriveClient();
  
  const folderMetadata = {
    name: `${customerName} - ${customerId}`,
    mimeType: 'application/vnd.google-apps.folder'
  };

  const folder = await drive.files.create({
    requestBody: folderMetadata,
    fields: 'id'
  });

  return folder.data.id!;
}

export async function uploadImageToDrive(
  folderId: string,
  fileName: string,
  mimeType: string,
  fileBuffer: Buffer
): Promise<string> {
  const drive = await getGoogleDriveClient();

  const fileMetadata = {
    name: fileName,
    parents: [folderId]
  };

  const media = {
    mimeType: mimeType,
    body: Readable.from(fileBuffer)
  };

  const file = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, webViewLink'
  });

  return file.data.id!;
}

export async function createMeasurementSheet(
  customerName: string,
  customerId: string
): Promise<string> {
  const sheets = await getGoogleSheetsClient();
  
  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: `Measurements - ${customerName} (${customerId})`
      },
      sheets: [{
        properties: {
          title: 'Sheet1'
        }
      }]
    }
  });

  const sheetId = spreadsheet.data.spreadsheetId!;

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: 'Sheet1!A1:J1',
    valueInputOption: 'RAW',
    requestBody: {
      values: [['Date', 'Garment Type', 'Chest', 'Waist', 'Hips', 'Shoulder', 'Sleeves', 'Length', 'Inseam', 'Notes']]
    }
  });

  return sheetId;
}

export async function addMeasurementToSheet(
  sheetId: string,
  measurement: {
    garmentType: string;
    chest?: string;
    waist?: string;
    hips?: string;
    shoulder?: string;
    sleeves?: string;
    length?: string;
    inseam?: string;
    notes?: string;
  }
): Promise<void> {
  const sheets = await getGoogleSheetsClient();
  
  const date = new Date().toISOString().split('T')[0];
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Sheet1!A:J',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        date,
        measurement.garmentType,
        measurement.chest || '',
        measurement.waist || '',
        measurement.hips || '',
        measurement.shoulder || '',
        measurement.sleeves || '',
        measurement.length || '',
        measurement.inseam || '',
        measurement.notes || ''
      ]]
    }
  });
}
