/**
 * defines a .c or .cpp header that defines
 * @field namespace is the namespace name
 * @field class is the name of the class
 * @field methods is the array that contanins the methods signatures
 */
export class header {
    namespace?: string;
    class?: string;
    includes: Array<string> = new Array<string>();
    methods: Array<string> = new Array<string>();
}

/**
 * parses the C/C++ header file
 * @param fileContent string that contains the file content divided by \n
 * @returns return a header instance that contanis the file parsed file
 */
export function parse(fileContent: string): header {
    let h: header = new header();
    let commentBlock: boolean = false;
    let bracketsCount: number = 0; //cout the number of { } to dertermine if a class ends
    let arrayFileContent = fileContent.split('\n');
    let temp: string;

    for(let i = 0; i < arrayFileContent.length; i++){
        temp = arrayFileContent[i].trimLeft();
        if(lineIsComment(temp)){
            commentBlock = temp.startsWith('/*') ? true : commentBlock;
        }
        if(commentBlock || lineIsComment(temp)){
            commentBlock = temp.includes('*/') ? false : commentBlock;
        }else{
            if(lineHasOpenBracket(temp)){
                bracketsCount++;
            }
            if(lineHasCloseBracket(temp)){
                bracketsCount--;
            }
            if(lineIsMain(temp)){
                i = arrayFileContent.length;
            }
            if(lineIsInclude(temp)){
                h.includes.push(temp);
            }
            if(lineIsMethodSignature(temp)){
                if(bracketsCount == 0 || (bracketsCount == 1 && h.namespace)){
                    h.methods.push(formatMethodsignature(temp.split(';')[0], undefined));
                }else{
                    h.methods.push(formatMethodsignature(temp.split(';')[0], h.class));
                }
            }
            if(lineIsClass(temp)){
                h.class = temp.split(' ')[1].trim();
            }
            if(lineIsNamespace(temp)){
                temp += temp.includes('{') ? '' : '{';
                h.namespace = temp;
            }
        }
    }

    return h;
}

/**
 * 
 * @param methodSignature the string contains the method signature to be parsed
 * @param className optional parameter that contains the class name to be added before the function name
 * 
 * @returns return a string that contains the formatted method signature
 */
function formatMethodsignature(methodSignature: string, className?: string | undefined): string {
	let arrayMethodSignature: Array<string> = methodSignature.split('(');
	let arrayMethodSignature2: Array<string> = arrayMethodSignature[0].split(' ');
	let formattedMethodSignature: string = '';

    if(className){
        if(arrayMethodSignature2.length > 1){
            for(let i = 0; i <= arrayMethodSignature2.length - 2; i++){
                formattedMethodSignature += arrayMethodSignature2[i] + ' ';
            }
        }
        formattedMethodSignature += `${className}::${arrayMethodSignature2[arrayMethodSignature2.length - 1] + '(' + arrayMethodSignature[arrayMethodSignature.length - 1]}`;
    }else{
        formattedMethodSignature = methodSignature;
    }

	return formattedMethodSignature;
}

export function indent(methodSignature: string, indentationStyle: string | undefined, tab: boolean): string {
    let separator: string = ' ';
    if(indentationStyle == "K&R")
        separator = ' ';
    if(indentationStyle == "Allman")
        separator = '\n';
    if(!indentationStyle)
        separator = ' ';

    return tab ? `\n\t${methodSignature}${separator}\t{\n\t\t\n\t}\n` : `\n${methodSignature}${separator}{\n\t\n}\n`
}

function lineIsInclude(line: string): boolean {
    return line.startsWith('#include');
}

function lineIsMethodSignature(line: string): boolean {
    return line.includes(');');
}

function lineIsClass(line: string): boolean {
    return line.startsWith('class');
}

function lineIsNamespace(line: string): boolean {
    return line.startsWith('namespace');
}

function lineIsComment(line: string): boolean {
    return line.startsWith('/*') || line.startsWith('//') || line.startsWith('*');
}

function lineIsMain(line: string): boolean {
    return line.includes('main');
}

function lineHasOpenBracket(line: string){
    return line.includes('{');
}

function lineHasCloseBracket(line: string){
    return line.includes('}');
}