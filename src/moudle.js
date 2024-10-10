import AppBackUpPage from './moudle/appBackUpPage'
import CustomizationPage from './moudle/customizationPage'
import PackageUploadPage from './moudle/packageUploadPage'
import PermissionPage from './moudle/permissionPage'
import {  RainbondEnterprisePagePlugin } from 'xu-demo-data'

export  const plugin = new RainbondEnterprisePagePlugin().setAppBackUpPage(AppBackUpPage).setCustomizationPagee(CustomizationPage).setPackageUploadPage(PackageUploadPage).setPermissionPage(PermissionPage)

// import EntryLogPage from './moudle/entryLogPage'
// import OperationLogPage from './moudle/operationLogPage'
// .setEntryLogPage(EntryLogPage).setOperationLogPage(OperationLogPage)
