export const options = {
  scenarios: {
    default: {
      executor: 'shared-iterations',
      options: { browser: { type: 'chromium' } },
    },
  },
}

export default function () {
  console.log('Event 0')
  console.log('Event 1')
  console.log('Event 2')
  console.log('Event 3')
  console.log('Event 4')
}
