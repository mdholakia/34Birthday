const EyeIcon = ({ color = '#1E1E1E', size = 32 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
  >
    <g clipPath="url(#clip0_32_60)">
      <path
        d="M1.33331 15.9999C1.33331 15.9999 6.66665 5.33325 16 5.33325C25.3333 5.33325 30.6666 15.9999 30.6666 15.9999C30.6666 15.9999 25.3333 26.6666 16 26.6666C6.66665 26.6666 1.33331 15.9999 1.33331 15.9999Z"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 19.9999C18.2091 19.9999 20 18.2091 20 15.9999C20 13.7908 18.2091 11.9999 16 11.9999C13.7908 11.9999 12 13.7908 12 15.9999C12 18.2091 13.7908 19.9999 16 19.9999Z"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_32_60">
        <rect width="32" height="32" fill="white"/>
      </clipPath>
    </defs>
  </svg>
)

export default EyeIcon
