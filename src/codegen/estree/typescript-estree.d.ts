declare module '@typescript-eslint/types' {
  namespace TSESTree {
    type NewLine = 'before' | 'after' | 'both'

    interface NodeOrTokenData {
      /**
       * Specifies how newlines should be added around the node.
       */
      newLine?: NewLine
    }
  }
}

export {}
