// Adapted from flow types here: https://github.com/A11yance/aria-query/blob/main/flow/aria.js
declare module 'aria-query' {
  export type ARIAAbstractRole =
    | 'command'
    | 'composite'
    | 'input'
    | 'landmark'
    | 'range'
    | 'roletype'
    | 'section'
    | 'sectionhead'
    | 'select'
    | 'structure'
    | 'widget'
    | 'window'

  export type ARIAWidgetRole =
    | 'button'
    | 'checkbox'
    | 'gridcell'
    | 'link'
    | 'menuitem'
    | 'menuitemcheckbox'
    | 'menuitemradio'
    | 'option'
    | 'progressbar'
    | 'radio'
    | 'scrollbar'
    | 'searchbox'
    | 'slider'
    | 'spinbutton'
    | 'switch'
    | 'tab'
    | 'tabpanel'
    | 'textbox'
    | 'treeitem'

  export type ARIACompositeWidgetRole =
    | 'combobox'
    | 'grid'
    | 'listbox'
    | 'menu'
    | 'menubar'
    | 'radiogroup'
    | 'tablist'
    | 'tree'
    | 'treegrid'

  export type ARIADocumentStructureRole =
    | 'application'
    | 'article'
    | 'blockquote'
    | 'caption'
    | 'cell'
    | 'columnheader'
    | 'definition'
    | 'deletion'
    | 'directory'
    | 'document'
    | 'emphasis'
    | 'feed'
    | 'figure'
    | 'generic'
    | 'group'
    | 'heading'
    | 'img'
    | 'insertion'
    | 'list'
    | 'listitem'
    | 'mark'
    | 'math'
    | 'meter'
    | 'none'
    | 'note'
    | 'paragraph'
    | 'presentation'
    | 'row'
    | 'rowgroup'
    | 'rowheader'
    | 'separator'
    | 'strong'
    | 'subscript'
    | 'superscript'
    | 'table'
    | 'term'
    | 'time'
    | 'toolbar'
    | 'tooltip'

  export type ARIALandmarkRole =
    | 'banner'
    | 'complementary'
    | 'contentinfo'
    | 'form'
    | 'main'
    | 'navigation'
    | 'region'
    | 'search'

  export type ARIALiveRegionRole =
    | 'alert'
    | 'log'
    | 'marquee'
    | 'status'
    | 'timer'

  export type ARIAWindowRole = 'alertdialog' | 'dialog'

  export type ARIAUncategorizedRole = 'code'

  export type ARIADPubRole =
    | 'doc-abstract'
    | 'doc-acknowledgments'
    | 'doc-afterword'
    | 'doc-appendix'
    | 'doc-backlink'
    | 'doc-biblioentry'
    | 'doc-bibliography'
    | 'doc-biblioref'
    | 'doc-chapter'
    | 'doc-colophon'
    | 'doc-conclusion'
    | 'doc-cover'
    | 'doc-credit'
    | 'doc-credits'
    | 'doc-dedication'
    | 'doc-endnote'
    | 'doc-endnotes'
    | 'doc-epigraph'
    | 'doc-epilogue'
    | 'doc-errata'
    | 'doc-example'
    | 'doc-footnote'
    | 'doc-foreword'
    | 'doc-glossary'
    | 'doc-glossref'
    | 'doc-index'
    | 'doc-introduction'
    | 'doc-noteref'
    | 'doc-notice'
    | 'doc-pagebreak'
    | 'doc-pagefooter'
    | 'doc-pageheader'
    | 'doc-pagelist'
    | 'doc-part'
    | 'doc-preface'
    | 'doc-prologue'
    | 'doc-pullquote'
    | 'doc-qna'
    | 'doc-subtitle'
    | 'doc-tip'
    | 'doc-toc'

  export type ARIAGraphicsRole =
    | 'graphics-document'
    | 'graphics-object'
    | 'graphics-symbol'

  export type ARIARole =
    | ARIAWidgetRole
    | ARIACompositeWidgetRole
    | ARIADocumentStructureRole
    | ARIALandmarkRole
    | ARIALiveRegionRole
    | ARIAWindowRole
    | ARIAUncategorizedRole
    | ARIADPubRole
    | ARIAGraphicsRole

  export type ARIARoleDefinitionKey =
    | ARIAAbstractRole
    | ARIARole
    | ARIADPubRole
    | ARIAGraphicsRole

  export type ARIANameFromSources = 'author' | 'contents' | 'prohibited'

  export type ARIARoleDefinition = {
    /* Abstract roles may not be used in HTML. */
    abstract: boolean
    accessibleNameRequired: boolean
    /* The concepts in related domains that inform behavior mappings. */
    baseConcepts: Array<ARIARoleRelation>
    /* Child presentational roles strip child nodes of roles and flatten the
     * content to text. */
    childrenPresentational: boolean
    nameFrom?: Array<ARIANameFromSources>
    /* aria-* properties and states disallowed on this role. */
    prohibitedProps: Array<keyof ARIAPropertyMap>[]
    /* aria-* properties and states allowed on this role. */
    props: ARIAPropertyMap
    /* The concepts in related domains that inform behavior mappings. */
    relatedConcepts: Array<ARIARoleRelation>
    requireContextRole?: Array<ARIARole>
    requiredContextRole?: Array<ARIARole>
    requiredOwnedElements?: Array<Array<string>>
    /* aria-* properties and states required on this role. */
    requiredProps: ARIAPropertyMap
    /* An array or super class "stacks." Each stack contains a LIFO list of
     * strings correspond to a super class in the inheritance chain of this
     * role. Roles may have more than one inheritance chain, which is why
     * this property is an array of arrays and not a single array. */
    superClass: Array<Array<ARIAAbstractRole | ARIARole | ARIADPubRole>>
  }

  export type RoleDefinitionTuple = [ARIARoleDefinitionKey, ARIARoleDefinition]
  export type RoleDefinitions = Array<RoleDefinitionTuple>

  export type ARIAState =
    | 'aria-busy'
    | 'aria-checked'
    | 'aria-disabled'
    | 'aria-expanded'
    | 'aria-grabbed'
    | 'aria-hidden'
    | 'aria-invalid'
    | 'aria-pressed'
    | 'aria-selected'

  export type ARIAProperty =
    | 'aria-activedescendant'
    | 'aria-atomic'
    | 'aria-autocomplete'
    | 'aria-braillelabel'
    | 'aria-brailleroledescription'
    | 'aria-colcount'
    | 'aria-colindex'
    | 'aria-colspan'
    | 'aria-controls'
    | 'aria-current'
    | 'aria-describedby'
    | 'aria-description'
    | 'aria-details'
    | 'aria-dropeffect'
    | 'aria-errormessage'
    | 'aria-flowto'
    | 'aria-haspopup'
    | 'aria-keyshortcuts'
    | 'aria-label'
    | 'aria-labelledby'
    | 'aria-level'
    | 'aria-live'
    | 'aria-modal'
    | 'aria-multiline'
    | 'aria-multiselectable'
    | 'aria-orientation'
    | 'aria-owns'
    | 'aria-placeholder'
    | 'aria-posinset'
    | 'aria-readonly'
    | 'aria-relevant'
    | 'aria-required'
    | 'aria-roledescription'
    | 'aria-rowcount'
    | 'aria-rowindex'
    | 'aria-rowspan'
    | 'aria-setsize'
    | 'aria-sort'
    | 'aria-valuemax'
    | 'aria-valuemin'
    | 'aria-valuenow'
    | 'aria-valuetext'
    | ARIAState

  // {| [AriaProperty]?: mixed |}
  export type ARIAPropertyMap = {
    'aria-activedescendant'?: mixed
    'aria-atomic'?: mixed
    'aria-autocomplete'?: mixed
    'aria-braillelabel'?: mixed
    'aria-brailleroledescription'?: mixed
    'aria-busy'?: mixed
    'aria-checked'?: mixed
    'aria-colcount'?: mixed
    'aria-colindex'?: mixed
    'aria-colspan'?: mixed
    'aria-controls'?: mixed
    'aria-current'?: ?ARIAPropertyCurrent
    'aria-describedby'?: mixed
    'aria-description'?: mixed
    'aria-details'?: mixed
    'aria-disabled'?: mixed
    'aria-dropeffect'?: mixed
    'aria-errormessage'?: mixed
    'aria-expanded'?: mixed
    'aria-flowto'?: mixed
    'aria-grabbed'?: mixed
    'aria-haspopup'?: mixed
    'aria-hidden'?: mixed
    'aria-invalid'?: mixed
    'aria-keyshortcuts'?: mixed
    'aria-label'?: mixed
    'aria-labelledby'?: mixed
    'aria-level'?: mixed
    'aria-live'?: mixed
    'aria-modal'?: mixed
    'aria-multiline'?: mixed
    'aria-multiselectable'?: mixed
    'aria-orientation'?: mixed
    'aria-owns'?: mixed
    'aria-placeholder'?: mixed
    'aria-posinset'?: mixed
    'aria-pressed'?: mixed
    'aria-readonly'?: mixed
    'aria-relevant'?: mixed
    'aria-required'?: mixed
    'aria-roledescription'?: mixed
    'aria-rowcount'?: mixed
    'aria-rowindex'?: mixed
    'aria-rowspan'?: mixed
    'aria-selected'?: mixed
    'aria-setsize'?: mixed
    'aria-sort'?: mixed
    'aria-valuemax'?: mixed
    'aria-valuemin'?: mixed
    'aria-valuenow'?: mixed
    'aria-valuetext'?: mixed
  }

  export type ARIAPropertyDefinition = {
    type:
      | 'string'
      | 'id'
      | 'idlist'
      | 'integer'
      | 'number'
      | 'boolean'
      | 'token'
      | 'tokenlist'
      | 'tristate'
    values?: Array<string | boolean>
    allowundefined?: boolean
  }

  export type ARIAPropertyCurrent =
    | 'page'
    | 'step'
    | 'location'
    | 'date'
    | 'time'
    | 'true'
    | 'false'
    | true
    | false

  export type ARIARoleRelation = {
    module?: string
    concept?: ARIARoleRelationConcept
  }

  /* The concept in a related domain that informs behavior mappings.
   * Related domains include: HTML, "Device Independence Delivery Unit", XForms,
   * and ARIA to name a few. */
  export type ARIARoleRelationConcept = {
    name: string
    attributes?: Array<ARIARoleRelationConceptAttribute>
    // These constraints are drawn from the mapping between ARIA and HTML:
    // https://www.w3.org/TR/html-aria
    constraints?: Array<
      | 'scoped to the body element'
      | 'scoped to the main element'
      | 'scoped to a sectioning root element other than body'
      | 'scoped to a sectioning content element'
      | 'direct descendant of document'
      | 'direct descendant of ol'
      | 'direct descendant of ul'
      | 'direct descendant of menu'
      | 'direct descendant of details element with the open attribute defined'
      | 'ancestor table element has table role'
      | 'ancestor table element has grid role'
      | 'ancestor table element has treegrid role'
      | 'the size attribute value is greater than 1'
      | 'the multiple attribute is not set and the size attribute does not have a value greater than 1'
      | 'the list attribute is not set'
    >
  }

  export type AttributeConstraint =
    | 'undefined' // The attribute does not exist on the node: <a>
    | 'set' // The attribute has a value: <a b="c">
    | '>1'

  export type ARIARoleRelationConceptAttribute = {
    name: string
    value?: string | number
    // These constraints are drawn from the mapping between ARIA and HTML:
    // https://www.w3.org/TR/html-aria
    constraints?: Array<AttributeConstraint>
  }

  export const elementRoles: Map<
    ARIARoleRelationConcept,
    Set<ARIARoleDefinitionKey>
  >

  export const roles: Map<ARIARoleDefinitionKey, ARIARoleDefinition>
}
