import React, { useState } from 'react'
import classes from './singleChoiceQuestion.module.scss'
import { RadioButton } from '../../atoms/radioButton'

interface SingleChoiceQuestionProps {
  options: any
  values: any
  onChange: (newValue: Array<string | number>) => void
}
export const SingleChoiceQuestion = ({
  options,
  onChange,
  values,
}: SingleChoiceQuestionProps): JSX.Element => {
  const [checkedOption, setCheckedOption] = useState<any>(values)
  console.log(values)
  const handleSelectOption = (option: any) => {
    setCheckedOption(option)
    onChange(option)
    console.log('option', option)
    console.log('option', onChange)
  }

  return (
    <fieldset className={classes.awell_single_choice_question}>
      {(options || []).map((option: any) => (
        <RadioButton
          onChange={() => handleSelectOption(option)}
          label={option.label}
          id={option.id}
          checked={option.id === checkedOption.id}
        />
      ))}
    </fieldset>
  )
}
