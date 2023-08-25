import {TerminalEngine} from "./engine";
import './styles/index.scss';

const appSelector = '#app';
const logLevel = 'debug';

export const terminal = new TerminalEngine(appSelector, logLevel);
terminal.processCommand('help', true);
window.onbeforeunload = () => {
    terminal.dispose();
}