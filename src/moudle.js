import AppBackUpPage from './moudle/appBackUpPage'
import CustomizationPage from './moudle/customizationPage'
import EntryLogPage from './moudle/entryLogPage'
import OperationLogPage from './moudle/operationLogPage'
import PackageUploadPage from './moudle/packageUploadPage'
import PermissionPage from './moudle/permissionPage'

import {  RainbondEnterprisePagePlugin } from 'xu-demo-data'

export  const plugin = new RainbondEnterprisePagePlugin().setAppBackUpPage(AppBackUpPage).CustomizationPage(CustomizationPage).setEntryLogPage(EntryLogPage).setOperationLogPage(OperationLogPage).setPackageUploadPage(PackageUploadPage).setPermissionPage(PermissionPage)
