export function printAST(node,  print: (str) => void = str => process.stdout.write(str), indent: string = '', last: boolean = true) {
    if (!node || !node.type)
        return;

    // Print indent
    print(indent);

    if (last) {
        print("└───");
        indent += "    ";
    } else {
        print("├───");
        indent += "│   ";
    }

    // Print node
    let properties = Object.entries(node)
        .filter(([k, v]) =>
            k !== 'type' && (
                typeof v === 'string' ||
                (Array.isArray(v) && v.length > 0 && typeof v[0] !== 'object')
        ))
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? `[${v.join(', ')}]` : `'${v}'`}`)
        .join(', ');
    if (properties !== '')
        properties = `{ ${properties} }`;
    print(`[${node.type}] ${properties ? '— ' : ''}${properties}\n`);

    // Find children
    const children = Object.values(node).filter(value => {
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] && value[0].hasOwnProperty('type'))
            return true;
        else if (typeof value === 'object' && value && value.hasOwnProperty('type'))
            return true;
        return false;
    }).reduce<any[]>((accumulator, value) => Array.isArray(value) ? [...accumulator, ...value] : [...accumulator, value], []);

    // Print each child node
    for (let i = 0; i < children.length; i++) {
        printAST(children[i], print, indent, i == children.length - 1);
    }
}