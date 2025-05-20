import { markdownToHtml } from '@utils/markdown'
import { ReactElement } from 'react'
import styles from './index.module.css'

const Markdown = ({
  text,
  blockImages,
  className
}: {
  text: string
  blockImages?: boolean
  className?: string
}): ReactElement => {
  const content = !blockImages
    ? markdownToHtml(text).replaceAll(
        /<a href="(https:\/\/[^"]+)">/g,
        `<a href="$1" target="_blank" rel="noopener noreferrer">`
      )
    : markdownToHtml(text)
        .replaceAll(
          /<img[\w\W]+?\/?>/g,
          `<img src="/images/image_blocked_placeholder.png" alt="Blocked image placeholder" class="${styles.blockedContentImage}" />`
        )
        .replaceAll(
          /<a href="(https:\/\/[^"]+)">/g,
          `<a href="$1" target="_blank" rel="noopener noreferrer">`
        )

  return (
    <div
      className={`${styles.markdown} ${className}`}
      // Note: We serialize and kill all embedded HTML over in markdownToHtml()
      // so the danger here is gone.
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}

export default Markdown
