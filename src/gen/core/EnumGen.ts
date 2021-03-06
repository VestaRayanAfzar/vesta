import { pascalCase } from "../../util/StringUtil";

export interface IEnumProperty {
    name: string;
    index: number;
}

export class EnumGen {

    public name: string;
    protected shouldBeExported: boolean = true;
    private startIndex: number = 1;
    private properties: IEnumProperty[] = [];

    constructor(name: string) {
        this.name = pascalCase(name);
    }

    public shouldExport(shouldBeExported: boolean = true) {
        this.shouldBeExported = shouldBeExported;
    }

    public addProperty(name: string, index?: number) {
        name = pascalCase(name);
        if (!index || index < 0) { index = 0; }
        for (let i = this.properties.length; i--;) {
            if (this.properties[i].name === name) {
                if (index) {
                    this.properties[i].index = index;
                }
                return;
            }
        }
        this.properties.push({ name, index });
        this.properties = this.properties.sort((a: IEnumProperty, b: IEnumProperty) => {
            return a.index - b.index;
        });
    }

    public setStartIndex(index: number) {
        for (let i = this.properties.length; i--;) {
            if (this.properties[i].index === index) {
                return;
            }
        }
        if (index >= 0) {
            this.startIndex = index;
        }
    }

    public generate(): string {
        let code = this.shouldBeExported ? "export " : "";
        const props: string[] = [];

        code += `enum ${this.name} {`;
        for (let i = 0, il = this.properties.length; i < il; ++i) {
            if (this.properties[i].index) {
                props.push(`${this.properties[i].name} = ${this.properties[i].index}`);
            } else if (i === 0 && this.startIndex > 0) {
                props.push(`${this.properties[i].name} = ${this.startIndex}`);
            } else {
                props.push(this.properties[i].name);
            }
        }
        code = `${code}${props.join(", ")}}`;
        return code;
    }
}
