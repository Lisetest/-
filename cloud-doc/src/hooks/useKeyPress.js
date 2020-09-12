import {useState,useEffect} from 'react'

const useKeyPress = (targetKeyCode)=>{
    const [keyPressed,setKeyPressed] = useState(false)

    const KeyDownHandler = ({keyCode})=>{
        if (keyCode === targetKeyCode)
        {
            setKeyPressed(true)
        }
    }

    const KeyUpHandler = ({ keyCode }) => {
        if (keyCode === targetKeyCode) {
            setKeyPressed(false)
        }
    }

    useEffect(()=>{
        document.addEventListener('keyup', KeyUpHandler)
        document.addEventListener('keydown', KeyDownHandler)
        return ()=>{
            document.removeEventListener('keyup', KeyUpHandler)
            document.removeEventListener('keydown', KeyDownHandler)
        }
    },[]) //空数组，加载的添加事件，卸载是清楚掉
    return keyPressed
}

export default useKeyPress