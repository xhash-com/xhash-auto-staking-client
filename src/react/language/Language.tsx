import React, {FC, ReactElement} from 'react'

import zhTW from "./locale/zh_TW"
import enUS from "./locale/en_US"
import {LanguageEnum} from "../types";

type LanguageProps = {
  language: LanguageEnum,
  id: any
}

export const LanguageFunc = (id: any, language: LanguageEnum) => {
  const LanguagePack = language === LanguageEnum.enUS || language == null ? enUS : zhTW

  if (id && LanguagePack && LanguagePack[id as keyof typeof LanguagePack]) {
    return LanguagePack[id as keyof typeof LanguagePack]
  }
  return id
}

export const Language: FC<LanguageProps> = (props): ReactElement => {
  return (
      <React.Fragment>
        {LanguageFunc(props.id, props.language)}
      </React.Fragment>
  )
}
