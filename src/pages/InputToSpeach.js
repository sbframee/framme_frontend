import React,{useState} from 'react'

import { useSpeechSynthesis } from 'react-speech-kit';
const InputToSpeach = () => {
  const [speechInputs, setSpeechInputs] = useState({ s1: "", s2: "", s3: "" })
  const { speak } = useSpeechSynthesis();
  const playSpeech = () => {
    speak({ text: speechInputs.s1 })
    speak({ text: speechInputs.s2 })
    speak({ text: speechInputs.s3 })
  }
  return (
    <div>
      <input placeholder='Speech One' value={speechInputs.s1} onChange={e => setSpeechInputs({ ...speechInputs, s1: e.target.value })} />
      <br/>
      <input placeholder='Speech Two' value={speechInputs.s2} onChange={e => setSpeechInputs({ ...speechInputs, s2: e.target.value })} />
      <br/>
      <input placeholder='Speech Three' value={speechInputs.s3} onChange={e => setSpeechInputs({ ...speechInputs, s3: e.target.value })} />
      <br/>
      <button onClick={playSpeech}>Play</button>
    </div>
  )
}

export default InputToSpeach