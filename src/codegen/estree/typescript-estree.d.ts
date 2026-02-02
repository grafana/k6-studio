declare module '@typescript-eslint/types' {
  namespace TSESTree {
    /**
     * Options for specifying new line behavior around a node. Specifying
     * `"never"` will prevent any new lines from being added in that position,
     * even if other formatting rules would normally add them.
     */
    type NewLineOption = boolean | 'never'

    type NewLine = {
      before?: NewLineOption
      after?: NewLineOption
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
