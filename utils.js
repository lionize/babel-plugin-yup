import {types as t} from 'babel-core'

const isYupImportDeclaration = path => path.node.source.value === 'yup'

const isValidImport = path =>
  path.isImportDefaultSpecifier() || path.isImportNamespaceSpecifier()

const hasImport = path => {
  let found = false

  path.traverse({
    ImportDeclaration(path) {
      if (isYupImportDeclaration(path)) {
        found = true
        path.stop()
      }
    },
  })

  return found
}

const getImportName = path => {
  let name = null

  path.traverse({
    ModuleSpecifier(path) {
      if (isValidImport(path)) {
        name = path.node.local.name
      }
    },
  })

  return name
}

const getPropertyName = path => {
  if (!path.parentPath.isMemberExpression()) {
    throw new TypeError(
      `unknown reference parent of type ${
        path.parentPath.type
      } found for node ${path.type}`
    )
  }

  return path.parentPath.node.property.name
}

const findImportPropertiesInPathScope = (path, importName) =>
  path.scope.getBinding(importName).referencePaths

const getImportPropertyNamesFromScope = (path, importName) =>
  findImportPropertiesInPathScope(path, importName)
    .map(getPropertyName)
    .filter(Boolean)
    .reduce((acc, name) => {
      if (!acc.includes(name)) {
        acc.push(name)
      }
      return acc
    }, [])

const replaceImportWithPropertyNames = (path, propertyNames) => {
  const specifiers = propertyNames.map(name => {
    const identifier = t.identifier(name)
    const specifier = t.importSpecifier(identifier, identifier)
    return specifier
  })
  const source = t.stringLiteral('yup')

  path.traverse({
    ImportDeclaration(path) {
      if (!isYupImportDeclaration(path)) {
        return
      }

      const importDeclaration = t.ImportDeclaration(specifiers, source)

      path.replaceWith(importDeclaration)
      path.stop()
    },
  })
}

const replaceImportExpressions = (path, importName) =>
  findImportPropertiesInPathScope(path, importName).forEach(path => {
    const {parentPath} = path

    if (!parentPath.isMemberExpression()) {
      return
    }

    const name = getPropertyName(path)
    const identifier = t.identifier(name)

    parentPath.replaceWith(identifier)
  })

export {
  hasImport,
  getImportName,
  getImportPropertyNamesFromScope,
  replaceImportWithPropertyNames,
  replaceImportExpressions,
}
