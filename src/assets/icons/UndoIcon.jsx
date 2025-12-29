const UndoIcon = ({ color = '#B3B3B3', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 15.3333 11.3333"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 10.3333L1 5.66667L7 1.00001V10.3333Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.3333 10.3333L8.33333 5.66667L14.3333 1.00001V10.3333Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default UndoIcon
