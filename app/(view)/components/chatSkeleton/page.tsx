import React from 'react'
import ContentLoader from 'react-content-loader'

const ChatSkeleton = (props :any) => {
  return (

   
    <ContentLoader viewBox="0 0 446 160" height={260} 
    backgroundColor="#c3c9c9"
    foregroundColor="#c3c9c9"
     {...props} >
      <circle cx="19" cy="25" r="16" />
      <rect x="39" y="12" rx="5" ry="5" width="220" height="10"/>
      <rect x="40" y="29" rx="5" ry="5" width="220" height="10" />
      <circle cx="420" cy="71" r="16" />
      <rect x="179" y="76" rx="5" ry="5" width="220" height="10" />
      <rect x="179" y="58" rx="5" ry="5" width="220" height="10" />
      <circle cx="21" cy="117" r="16" />
      <rect x="45" y="104" rx="5" ry="5" width="220" height="10" />
      <rect x="45" y="122" rx="5" ry="5" width="220" height="10" />
      <circle cx="19" cy="25" r="16" />
      <rect x="39" y="12" rx="5" ry="5" width="220" height="10" />
      <rect x="40" y="29" rx="5" ry="5" width="220" height="10" />
      <circle cx="420" cy="71" r="16" />
      <rect x="179" y="76" rx="5" ry="5" width="220" height="10" />
      <rect x="179" y="58" rx="5" ry="5" width="220" height="10" />
      <circle cx="21" cy="117" r="16" />
      <rect x="65" y="104" rx="5" ry="5" width="220" height="10" />
      <rect x="65" y="122" rx="5" ry="5" width="220" height="10" />
    </ContentLoader>
   
  )
}



export default ChatSkeleton