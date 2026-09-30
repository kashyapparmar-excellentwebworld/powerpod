import sanitizeHtml from 'sanitize-html'

/**
 * Sanitizes rich HTML content from editor to prevent XSS attacks
 * while preserving rich text structure (headings, lists, tables, images, formatting, blockquotes, code, etc.)
 */
export function sanitizeContentHtml(html: string): string {
  if (!html) return ''

  return sanitizeHtml(html, {
    allowedTags: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'div',
      'span',
      'b',
      'i',
      'strong',
      'em',
      'u',
      's',
      'strike',
      'sub',
      'sup',
      'mark',
      'ul',
      'ol',
      'li',
      'dl',
      'dt',
      'dd',
      'table',
      'thead',
      'tbody',
      'tfoot',
      'tr',
      'th',
      'td',
      'caption',
      'blockquote',
      'q',
      'cite',
      'pre',
      'code',
      'kbd',
      'samp',
      'var',
      'a',
      'img',
      'hr',
      'br',
      'figure',
      'figcaption',
    ],
    allowedAttributes: {
      '*': ['class', 'id', 'style', 'dir', 'lang'],
      a: ['href', 'name', 'target', 'rel', 'title', 'download'],
      img: ['src', 'srcset', 'sizes', 'alt', 'title', 'width', 'height', 'loading'],
      td: ['colspan', 'rowspan', 'headers', 'scope'],
      th: ['colspan', 'rowspan', 'headers', 'scope'],
    },
    allowedSchemes: ['http', 'https', 'ftp', 'mailto', 'tel', 'data'],
    allowedSchemesByTag: {
      img: ['http', 'https', 'data'],
    },
    allowedStyles: {
      '*': {
        'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
        color: [/^#(0-9a-f]{3,8})$/i, /^rgb\(/, /^hsl\(/],
        'background-color': [/^#(0-9a-f]{3,8})$/i, /^rgb\(/, /^hsl\(/],
        'font-size': [/^\d+(px|em|rem|%)$/],
        'font-weight': [/^\d+$/, /^bold$/, /^normal$/],
        'text-decoration': [/^underline$/, /^line-through$/],
        margin: [/^\d+(px|em|rem|%)$/],
        padding: [/^\d+(px|em|rem|%)$/],
      },
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
    },
  })
}
