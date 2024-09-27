import App from './moudle/root'
import Other from './moudle/other'
import { RainbondRootPagePlugin } from 'xu-demo-data'

export  const plugin = new RainbondRootPagePlugin().setRootPage(App).addOtherPage(Other)