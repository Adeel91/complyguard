import type { Node } from "ts-morph";

export function getNodeLocation(node: Node) {
  const sourceFile = node.getSourceFile();
  const position = sourceFile.getLineAndColumnAtPos(node.getStart());

  return {
    file: sourceFile.getFilePath(),
    line: position.line,
    column: position.column,
  };
}
