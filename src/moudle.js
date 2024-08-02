import React from 'react'
import ReactDom from 'react-dom'
import App from './page/app/index'
import { AppPagePlugin  } from 'xu-demo-data'

export const AppPagePlugin = new AppPagePlugin().setRootPage(App)