import App from './page/content/index'
import Other from './page/other/index'
import { RainbondRootPagePlugin } from 'xu-demo-data'
import './assets/styles/reset.css'

export  const plugin = new RainbondRootPagePlugin().setRootPage(App).addOtherPage(Other)