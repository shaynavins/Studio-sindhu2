import { getGoogleDriveClient, getGoogleSheetsClient } from './google-clients';
import { Readable } from 'stream';

// Function to get or create the main "Customers" folder
async function getCustomersParentFolder(): Promise<string> {
  const drive = await getGoogleDriveClient();
  
  // Search for existing "Customers" folder
  const response = await drive.files.list({
    q: "name='Customers' and mimeType='application/vnd.google-apps.folder' and trashed=false",
    fields: 'files(id, name)',
    pageSize: 1
  });

  if (response.data.files && response.data.files.length > 0) {
    return response.data.files[0].id!;
  }

  // Create "Customers" folder if it doesn't exist
  const folderMetadata = {
    name: 'Customers',
    mimeType: 'application/vnd.google-apps.folder'
  };

  const folder = await drive.files.create({
    requestBody: folderMetadata,
    fields: 'id'
  });

  return folder.data.id!;
}

export async function createCustomerFolder(customerPhone: string, customerName: string): Promise<string> {
  const drive = await getGoogleDriveClient();
  const parentFolderId = await getCustomersParentFolder();
  
  const folderMetadata = {
    name: `${customerPhone} - ${customerName}`,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentFolderId]
  };

  const folder = await drive.files.create({
    requestBody: folderMetadata,
    fields: 'id'
  });

  return folder.data.id!;
}

export async function findCustomerFolder(customerPhone: string): Promise<string | null> {
  const drive = await getGoogleDriveClient();
  const parentFolderId = await getCustomersParentFolder();
  
  const response = await drive.files.list({
    q: `name contains '${customerPhone}' and mimeType='application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed=false`,
    fields: 'files(id, name)',
    pageSize: 1
  });

  return response.data.files?.[0]?.id || null;
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
  customerPhone: string,
  customerName: string,
  folderId: string
): Promise<string> {
  const sheets = await getGoogleSheetsClient();
  const drive = await getGoogleDriveClient();
  
  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: `${customerPhone} - Measurements`
      },
      sheets: [{
        properties: {
          title: 'Orders'
        }
      }]
    }
  });

  const sheetId = spreadsheet.data.spreadsheetId!;

  // Move sheet to customer folder
  await drive.files.update({
    fileId: sheetId,
    addParents: folderId,
    removeParents: 'root'
  });

  // Add header row
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: 'Orders!A1:M1',
    valueInputOption: 'RAW',
    requestBody: {
      values: [['Order Number', 'Date', 'Garment Type', 'Chest', 'Waist', 'Hips', 'Shoulder', 'Sleeves', 'Length', 'Inseam', 'Notes', 'Status', 'Delivery Date']]
    }
  });

  return sheetId;
}

export async function findMeasurementSheet(folderId: string): Promise<string | null> {
  const drive = await getGoogleDriveClient();
  
  const response = await drive.files.list({
    q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet'`,
    fields: 'files(id, name)',
    pageSize: 1
  });

  return response.data.files?.[0]?.id || null;
}

export async function addMeasurementToSheet(
  sheetId: string,
  orderNumber: string,
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
    status?: string;
    deliveryDate?: string;
  }
): Promise<number> {
  const sheets = await getGoogleSheetsClient();
  
  const date = new Date().toISOString().split('T')[0];
  
  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Orders!A:M',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        orderNumber,
        date,
        measurement.garmentType,
        measurement.chest || '',
        measurement.waist || '',
        measurement.hips || '',
        measurement.shoulder || '',
        measurement.sleeves || '',
        measurement.length || '',
        measurement.inseam || '',
        measurement.notes || '',
        measurement.status || 'new',
        measurement.deliveryDate || ''
      ]]
    }
  });

  // Extract row number from the update range
  const updatedRange = response.data.updates?.updatedRange || '';
  const rowMatch = updatedRange.match(/Orders!A(\d+)/);
  return rowMatch ? parseInt(rowMatch[1]) : 0;
}

export async function getMeasurementsFromSheet(
  sheetId: string
): Promise<Array<{orderNumber: string, date?: string, garmentType: string, chest?: string, waist?: string, hips?: string, shoulder?: string, sleeves?: string, length?: string, inseam?: string, notes?: string, status?: string, deliveryDate?: string}>> {
  const sheets = await getGoogleSheetsClient();
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Orders!A2:M'
  });

  const rows = response.data.values || [];
  return rows.map(row => ({
    orderNumber: row[0] || '',
    date: row[1] || undefined,
    garmentType: row[2] || '',
    chest: row[3] || undefined,
    waist: row[4] || undefined,
    hips: row[5] || undefined,
    shoulder: row[6] || undefined,
    sleeves: row[7] || undefined,
    length: row[8] || undefined,
    inseam: row[9] || undefined,
    notes: row[10] || undefined,
    status: row[11] || undefined,
    deliveryDate: row[12] || undefined
  }));
}

export async function updateOrderStatusInSheet(
  sheetId: string,
  orderNumber: string,
  status: string,
  deliveryDate?: string
): Promise<void> {
  const sheets = await getGoogleSheetsClient();
  
  // Get all rows to find the order
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Orders!A2:M'
  });

  const rows = response.data.values || [];
  const rowIndex = rows.findIndex(row => row[0] === orderNumber);
  
  if (rowIndex === -1) {
    throw new Error('Order not found');
  }

  // Update status (column L) and delivery date (column M) for the found row
  const actualRowNumber = rowIndex + 2; // +2 because arrays are 0-indexed and we start from row 2
  
  const updates: any[] = [
    {
      range: `Orders!L${actualRowNumber}`,
      values: [[status]]
    }
  ];

  if (deliveryDate !== undefined) {
    updates.push({
      range: `Orders!M${actualRowNumber}`,
      values: [[deliveryDate]]
    });
  }

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      valueInputOption: 'RAW',
      data: updates
    }
  });
}
