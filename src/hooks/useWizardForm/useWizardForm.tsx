import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  convertToAwellInput,
  getInitialValues,
  isEmpty,
  updateVisibility,
} from './helpers'
import {
  AnswerValue,
  FormSettingsContextInterface,
  FormSettingsContextProps,
  FormError,
  QuestionType,
  QuestionWithVisibility,
} from './types'

const useWizardForm = ({
  questions,
  evaluateDisplayConditions,
  onSubmit,
  errorLabels,
}: FormSettingsContextProps): FormSettingsContextInterface => {
  const formMethods = useForm({
    defaultValues: getInitialValues(questions),
    shouldUnregister: false,
    shouldFocusError: true,
    mode: 'all',
  })
  const [visibleQuestions, setVisibleQuestions] = useState<
    Array<QuestionWithVisibility>
  >([])
  const [errors, setErrors] = useState<Array<FormError>>([])
  const [current, setCurrent] = useState(-1)

  const updateQuestionVisibility = useCallback(async () => {
    const formValuesInput = convertToAwellInput(formMethods.getValues())
    const evaluationResults = await evaluateDisplayConditions(formValuesInput)
    const updatedQuestions = updateVisibility(
      questions,
      evaluationResults
    ).filter((e) => e.visible)
    setVisibleQuestions(updatedQuestions)
  }, [questions])

  useEffect(() => {
    updateQuestionVisibility()
  }, [updateQuestionVisibility])

  const handleCheckForErrors = (): boolean => {
    const currentQuestion = visibleQuestions?.[current]
    const errorsWithoutCurrent = errors.filter(
      (err) => err.id !== currentQuestion?.id
    )
    setErrors(errorsWithoutCurrent)
    if (currentQuestion?.userQuestionType === QuestionType.Description) {
      return false
    }

    if (
      currentQuestion?.questionConfig?.mandatory &&
      isEmpty(formMethods.getValues(currentQuestion.id))
    ) {
      const errorsWithoutCurrent = errors.filter(
        (err) => err.id !== currentQuestion.id
      )
      setErrors([
        ...errorsWithoutCurrent,
        { id: currentQuestion.id, error: errorLabels.required },
      ])
      return true
    }
    return false
  }
  const handleGoToNextQuestion = async () => {
    await updateQuestionVisibility().finally(() => {
      const hasErrors = handleCheckForErrors()
      if (!hasErrors) {
        setCurrent(current + 1)
      }
    })
    if (current === -1) {
      setCurrent(current + 1)
    }
  }
  const handleGoToPrevQuestion = () => {
    setCurrent(current - 1)
  }

  const submitForm = () => {
    const hasErrors = handleCheckForErrors()

    if (!hasErrors) {
      formMethods.handleSubmit(
        async (formResponse: Record<string, AnswerValue>) => {
          await onSubmit(convertToAwellInput(formResponse))
        }
      )()
    }
  }

  return {
    updateQuestionVisibility,
    submitForm,
    handleGoToNextQuestion,
    handleGoToPrevQuestion,
    formMethods,
    currentQuestion: visibleQuestions?.[current],
    errors,
    isFirstQuestion: current === 0,
    isLastQuestion: current === visibleQuestions.length - 1,
    isEntryPage: current === -1,
  }
}

export { useWizardForm }
