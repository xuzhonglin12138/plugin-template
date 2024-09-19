import App from './page/content/index'
import Other from './page/other/index'
import { RainbondRootPagePlugin } from 'xu-demo-data'

export  const plugin = new RainbondRootPagePlugin().setRootPage(App).addOtherPage(Other)