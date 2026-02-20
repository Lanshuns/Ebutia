import { ChatbotHandler } from '../../index';
import config from '../../../config.json';

export abstract class BaseHandler implements ChatbotHandler {
    abstract name: string;
    protected abstract chatbotKey: keyof typeof config.chatbots;

    protected get config() {
        return config.chatbots[this.chatbotKey];
    }

    canHandle(url: string): boolean {
        return this.config.urlPatterns.some(pattern => url.includes(pattern));
    }

    protected findElement(selectors: string[], root: Document | ShadowRoot = document): HTMLElement | null {
        for (const selector of selectors) {
            const el = root.querySelector(selector);
            if (el) return el as HTMLElement;
        }
        return null;
    }

    protected delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    protected async clickWebSearch(): Promise<void> {
        const cfg = this.config as any;
        if (cfg.webSearchButton) {
            const btn = this.findElement(cfg.webSearchButton);
            if (btn) {
                btn.click();
                await this.delay(500);
            }
        }
    }

    async fillPrompt(prompt: string): Promise<boolean> {
        const root = this.getRoot();
        const inputElement = this.findElement(this.config.input, root);
        if (!inputElement) return false;

        this.fillInput(inputElement, prompt);

        await this.clickWebSearch();
        await this.delay(this.getSubmitDelay());

        this.clickSubmit(root);

        return true;
    }

    protected getRoot(): Document | ShadowRoot {
        return document;
    }

    protected getSubmitDelay(): number {
        return 500;
    }

    protected fillInput(el: HTMLElement, prompt: string): void {
        el.focus();
        el.click();

        if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
            const valueSetter = Object.getOwnPropertyDescriptor(el, 'value')?.set;
            const prototype = Object.getPrototypeOf(el);
            const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

            if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
                prototypeValueSetter.call(el, prompt);
            } else if (valueSetter) {
                valueSetter.call(el, prompt);
            } else {
                el.value = prompt;
            }
        } else {
            const selection = window.getSelection();
            if (selection) {
                const range = document.createRange();
                range.selectNodeContents(el);
                selection.removeAllRanges();
                selection.addRange(range);

                range.deleteContents();

                const textNode = document.createTextNode(prompt);
                range.insertNode(textNode);

                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }

            const event = new InputEvent('input', {
                bubbles: true,
                cancelable: true,
                inputType: 'insertText',
                data: prompt,
                view: window,
            });
            el.dispatchEvent(event);
        }

        const events = [
            new Event('input', { bubbles: true }),
            new Event('change', { bubbles: true })
        ];
        events.forEach(event => el.dispatchEvent(event));
    }

    protected clickSubmit(root: Document | ShadowRoot): void {
        const cfg = this.config as any;
        let submitButton: HTMLElement | null = null;

        if (cfg.sendButton) {
            submitButton = this.findElement(cfg.sendButton, root);
        }

        if (submitButton) {
            submitButton.click();
        }
    }
}
