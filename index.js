import {types as t} from 'babel-core'

const getValidSpecifierLocalName = path =>
  path.node.specifiers.find(
    specifier =>
      t.isImportDefaultSpecifier(specifier) ||
      t.isImportNamespaceSpecifier(specifier)
  ).local.name

const isValidImportSpecifier = path =>
  path.node.specifiers &&
  path.node.specifiers.some(
    specifier =>
      t.isImportDefaultSpecifier(specifier) ||
      t.isImportNamespaceSpecifier(specifier)
  )

const isValidImportDeclaration = path =>
  path.node.source &&
  path.node.source.value === 'yup' &&
  isValidImportSpecifier(path)

const getScopedNameReferencePaths = (path, name) =>
  path.scope.getBinding(name).referencePaths

const getUniqueReferencePropertyNames = paths =>
  paths
    .map(ref => ref.parent.property.name)
    .reduce((acc, name) => (!acc.includes(name) && acc.push(name), acc), [])

const mapPropertiesToUniqueScopeNames = (path, properties) =>
  properties.reduce(
    (acc, name) => (
      (acc[name] = path.scope.generateUidIdentifier(name).name), acc
    ),
    {}
  )

const getReferencePropertyImportSpecifiers = propertyNamesMap =>
  Object.keys(propertyNamesMap).map(name => {
    const localName = propertyNamesMap[name]
    return t.importSpecifier(t.identifier(localName), t.identifier(name))
  })

const replaceReferenceWithIdentifier = namesMap => ref => {
  const refName = ref.parent.property.name
  const identifier = t.identifier(namesMap[refName])
  ref.parentPath.replaceWith(identifier)
}

export default () => {
  const visitor = {
    ImportDeclaration(path) {
      if (!isValidImportDeclaration(path)) {
        return
      }

      const name = getValidSpecifierLocalName(path)
      const refs = getScopedNameReferencePaths(path, name)
      const propertyNames = getUniqueReferencePropertyNames(refs)
      const uniquePropertyNamesMap = mapPropertiesToUniqueScopeNames(
        path,
        propertyNames
      )
      const importSpecifiers = getReferencePropertyImportSpecifiers(
        uniquePropertyNamesMap
      )
      path.node.specifiers = importSpecifiers

      refs.forEach(replaceReferenceWithIdentifier(uniquePropertyNamesMap))
      path.stop()
    },
  }

  return {
    name: 'babel-plugin-yup',
    visitor,
  }
}
