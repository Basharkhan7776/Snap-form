import { google } from "googleapis"
import { Field } from "./types"

// ============================================
// GOOGLE SHEETS API CONFIGURATION
// ============================================

const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")

if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
  console.warn("⚠️  Google Service Account credentials not configured. Google Sheets integration will not work.")
}

// Create JWT client for service account authentication
const getAuthClient = () => {
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    throw new Error("Google Service Account credentials not configured")
  }

  return new google.auth.JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.file",
    ],
  })
}

const sheets = google.sheets("v4")
const drive = google.drive("v3")

// ============================================
// SPREADSHEET OPERATIONS
// ============================================

/**
 * Create a new Google Sheet for a form
 * Returns the spreadsheet ID and URL
 */
export async function createFormSpreadsheet(
  formId: string,
  formTitle: string,
  fields: Field[]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const auth = getAuthClient()

  // Create spreadsheet
  const createResponse = await sheets.spreadsheets.create({
    auth,
    requestBody: {
      properties: {
        title: `${formTitle} - Responses`,
      },
      sheets: [
        {
          properties: {
            title: "Responses",
            gridProperties: {
              frozenRowCount: 1, // Freeze header row
            },
          },
        },
      ],
    },
  })

  const spreadsheetId = createResponse.data.spreadsheetId!
  const spreadsheetUrl = createResponse.data.spreadsheetUrl!

  // Prepare header row
  const headers = ["Timestamp", "Email", ...fields.filter(f => !["section_break", "divider"].includes(f.type)).map((f) => f.label)]

  // Add headers to the sheet
  await sheets.spreadsheets.values.update({
    auth,
    spreadsheetId,
    range: "Responses!A1",
    valueInputOption: "RAW",
    requestBody: {
      values: [headers],
    },
  })

  // Format header row (bold, background color)
  await sheets.spreadsheets.batchUpdate({
    auth,
    spreadsheetId,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: {
              sheetId: 0,
              startRowIndex: 0,
              endRowIndex: 1,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: {
                  red: 0.9,
                  green: 0.9,
                  blue: 0.9,
                },
                textFormat: {
                  bold: true,
                },
              },
            },
            fields: "userEnteredFormat(backgroundColor,textFormat)",
          },
        },
      ],
    },
  })

  return { spreadsheetId, spreadsheetUrl }
}

/**
 * Append a response to the Google Sheet
 * This is called in real-time when a form is submitted
 */
export async function appendResponseToSheet(
  spreadsheetId: string,
  responseData: {
    email?: string
    data: Record<string, any>
    createdAt: Date
  },
  fields: Field[]
): Promise<void> {
  const auth = getAuthClient()

  // Build row data in the same order as headers
  const timestamp = responseData.createdAt.toISOString()
  const email = responseData.email || "N/A"

  // Map response data to field order (excluding layout fields)
  const fieldValues = fields
    .filter(f => !["section_break", "divider"].includes(f.type))
    .map((field) => {
      const value = responseData.data[field.id]

      // Handle different field types
      if (value === undefined || value === null) {
        return ""
      }

      if (Array.isArray(value)) {
        // For checkboxes - join with commas
        return value.join(", ")
      }

      if (typeof value === "string") {
        return value
      }

      return String(value)
    })

  const row = [timestamp, email, ...fieldValues]

  // Append row to sheet
  await sheets.spreadsheets.values.append({
    auth,
    spreadsheetId,
    range: "Responses!A:A",
    valueInputOption: "RAW",
    requestBody: {
      values: [row],
    },
  })
}

/**
 * Share the spreadsheet with a user
 * Gives edit permissions to the form owner
 */
export async function shareSpreadsheet(
  spreadsheetId: string,
  userEmail: string,
  role: "reader" | "writer" = "writer"
): Promise<void> {
  const auth = getAuthClient()

  await drive.permissions.create({
    auth,
    fileId: spreadsheetId,
    requestBody: {
      type: "user",
      role,
      emailAddress: userEmail,
    },
    sendNotificationEmail: false, // Don't spam users with notification emails
  })
}

/**
 * Update spreadsheet headers when form fields change
 * This is called when a form is edited
 */
export async function updateSpreadsheetHeaders(
  spreadsheetId: string,
  fields: Field[]
): Promise<void> {
  const auth = getAuthClient()

  const headers = ["Timestamp", "Email", ...fields.filter(f => !["section_break", "divider"].includes(f.type)).map((f) => f.label)]

  await sheets.spreadsheets.values.update({
    auth,
    spreadsheetId,
    range: "Responses!A1",
    valueInputOption: "RAW",
    requestBody: {
      values: [headers],
    },
  })
}

/**
 * Delete a spreadsheet
 * Called when a form is deleted
 */
export async function deleteSpreadsheet(spreadsheetId: string): Promise<void> {
  const auth = getAuthClient()

  await drive.files.delete({
    auth,
    fileId: spreadsheetId,
  })
}

/**
 * Get spreadsheet URL from ID
 */
export function getSpreadsheetUrl(spreadsheetId: string): string {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
}

/**
 * Check if spreadsheet exists and is accessible
 */
export async function checkSpreadsheetAccess(spreadsheetId: string): Promise<boolean> {
  const auth = getAuthClient()

  try {
    await sheets.spreadsheets.get({
      auth,
      spreadsheetId,
    })
    return true
  } catch {
    return false
  }
}

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Bulk import existing responses to a newly created spreadsheet
 * Useful if Google Sheets integration is enabled after responses exist
 */
export async function bulkImportResponses(
  spreadsheetId: string,
  responses: Array<{
    email?: string
    data: Record<string, any>
    createdAt: Date
  }>,
  fields: Field[]
): Promise<void> {
  const auth = getAuthClient()

  // Build all rows
  const rows = responses.map((response) => {
    const timestamp = response.createdAt.toISOString()
    const email = response.email || "N/A"

    const fieldValues = fields
      .filter(f => !["section_break", "divider"].includes(f.type))
      .map((field) => {
        const value = response.data[field.id]

        if (value === undefined || value === null) return ""
        if (Array.isArray(value)) return value.join(", ")
        if (typeof value === "string") return value

        return String(value)
      })

    return [timestamp, email, ...fieldValues]
  })

  // Append all rows at once
  if (rows.length > 0) {
    await sheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "Responses!A2", // Start from row 2 (after headers)
      valueInputOption: "RAW",
      requestBody: {
        values: rows,
      },
    })
  }
}
