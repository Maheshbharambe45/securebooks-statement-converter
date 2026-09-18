# Microsoft Entra ID (Azure AD) Configuration Guide for Secure Books

This document guides Microsoft 365 administrators at **Secure Books** on setting up the Entra ID Application Registration for direct-to-Outlook document delivery via Microsoft Graph API.

---

## 1. Create App Registration

1. Log into the [Microsoft Entra Admin Center](https://entra.microsoft.com/) as a Global Administrator.
2. Navigate to **Identity** > **Applications** > **App registrations** > **New registration**.
3. Fill in the details:
   - **Name**: `Secure Books Document Submission Portal`
   - **Supported account types**: Accounts in this organizational directory only (Single tenant).
   - **Redirect URI**: Leave blank (this app uses Client Credentials / Daemon flow).
4. Click **Register**.
5. Note down the **Application (client) ID** and **Directory (tenant) ID** from the Overview page.

---

## 2. Create Client Secret

1. Under **Manage**, select **Certificates & secrets**.
2. Select **Client secrets** > **New client secret**.
3. Add a description (e.g., `Submission Portal Production Secret`) and select an expiration period (e.g., 24 months).
4. Click **Add**.
5. **Copy the Secret Value immediately** (it will be hidden after leaving the page).

---

## 3. Configure Microsoft Graph API Permissions

1. Under **Manage**, select **API permissions** > **Add a permission**.
2. Select **Microsoft Graph**.
3. Select **Application permissions** (not Delegated permissions).
4. Search for and check:
   - `Mail.Send` (Allows sending mail as any user without signed-in user interaction)
5. Click **Add permissions**.
6. Select **Grant admin consent for Secure Books** and confirm.

---

## 4. (Recommended Security) Restrict Application to Specific Mailbox

To ensure the portal application can only send mail from `info@securebooks.co.uk` and cannot send on behalf of other employees:

1. Open PowerShell on an admin workstation and connect to Exchange Online:
   ```powershell
   Connect-ExchangeOnline
   ```
2. Create a mail-enabled security group containing `info@securebooks.co.uk`:
   ```powershell
   New-DistributionGroup -Name "SubmissionPortalMailboxGroup" -Type "Security"
   Add-DistributionGroupMember -Identity "SubmissionPortalMailboxGroup" -Member "info@securebooks.co.uk"
   ```
3. Create an Application Access Policy restricting the Entra App ID to that group:
   ```powershell
   New-ApplicationAccessPolicy -AppId "<YOUR_CLIENT_ID>" -PolicyScopeGroupId "SubmissionPortalMailboxGroup" -AccessRight RestrictAccess -Description "Restrict submission portal to info@securebooks.co.uk"
   ```

---

## 5. Add Environment Variables to Backend

In your production backend environment (`.env`):

```env
MICROSOFT_TENANT_ID=xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MICROSOFT_CLIENT_ID=xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MICROSOFT_CLIENT_SECRET=your_client_secret_value_here
OUTLOOK_SENDER=info@securebooks.co.uk
OUTLOOK_RECIPIENT=info@securebooks.co.uk
USE_MOCK_GRAPH=false
```
