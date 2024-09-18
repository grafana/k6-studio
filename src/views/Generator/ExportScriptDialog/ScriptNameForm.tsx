import { FieldGroup } from '@/components/Form'
import { Box, TextField, Flex, AlertDialog, Button } from '@radix-ui/themes'
import { useFormContext } from 'react-hook-form'

export function ScriptNameForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  return (
    <>
      <AlertDialog.Description size="2" mb="4">
        Choose a descriptive filename to help you identify your work later. Once
        you&apos;ve named your script, click Export to save it.
      </AlertDialog.Description>

      <Box mb="5">
        <FieldGroup name="scriptName" label="Script name" errors={errors}>
          <TextField.Root placeholder="my-script" {...register('scriptName')} />
        </FieldGroup>
      </Box>

      <Flex justify="end" gap="2">
        <AlertDialog.Cancel>
          <Button variant="outline" color="orange">
            Cancel
          </Button>
        </AlertDialog.Cancel>

        <Button color="orange" type="submit">
          Export
        </Button>
      </Flex>
    </>
  )
}
