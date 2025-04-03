export interface Import {
  default: string | undefined
  named: Set<string>
  from: string
}

class ImportMap {
  #imports = new Map<string, Import>()

  get(from: string): Import {
    const imports = this.#imports.get(from)

    if (imports) {
      return imports
    }

    const newImports = {
      default: undefined,
      named: new Set<string>(),
      from,
    }

    this.#imports.set(from, newImports)

    return newImports
  }

  all() {
    return this.#imports.values()
  }
}

export class CodeGenContext {
  #imports = new ImportMap()

  constructor(imports = new ImportMap()) {
    this.#imports = imports
  }

  import(names: string[], from: string) {
    const imports = this.#imports.get(from)

    for (const name of names) {
      imports.named.add(name)
    }
  }

  importDefault(name: string, from: string) {
    const imports = this.#imports.get(from)

    imports.default = name
  }

  imports() {
    return this.#imports.all()
  }

  scenario() {
    return new ScenarioContext(this.#imports)
  }
}

export class ScenarioContext extends CodeGenContext {
  #async = false

  get async() {
    return this.#async
  }

  constructor(imports: ImportMap) {
    super(imports)
  }

  awaited() {
    this.#async = true
  }
}
