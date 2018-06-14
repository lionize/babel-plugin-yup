import {
  hasImport,
  getImportName,
  getImportPropertyNamesFromScope,
  replaceImportWithPropertyNames,
  replaceImportExpressions,
} from './utils'

const programVisitor = path => {
  if (!hasImport(path)) {
    return
  }

  const importName = getImportName(path)
  const propertyNames = getImportPropertyNamesFromScope(path, importName)
  replaceImportWithPropertyNames(path, propertyNames)
  replaceImportExpressions(path, importName)
}

const transform = () => {
  const visitor = {
    Program: programVisitor,
  }

  return {
    name: 'babel-plugin-yup',
    visitor,
  }
}

export default transform
