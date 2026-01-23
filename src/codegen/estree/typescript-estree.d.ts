declare module '@typescript-eslint/types' {
  namespace TSESTree {
    type NewLineOptions = boolean | 'never'

    type NewLine = {
      before?: boolean | 'never'
      after?: boolean | 'never'
    }

    interface NodeOrTokenData {
      /**
       * If set, this node is a placeholder for a comment and a
       * comment with the value will be printed instead.
       */
      comment?: string

      /**
       * Specifies how newlines should be added around the node.
       */
      newLine?: NewLine
    }
  }
}

export {}
