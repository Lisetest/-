//将数组打平，加上key值
export const flattenArr = (arr)=>{
    return arr.reduce((map,item)=>{ //66
        map[item.id] = item
        return map
    },{})   
}
//转成数组
export const objToArr = (obj)=>{
    return Object.keys(obj).map(key=>obj[key])
}

export const getParentNode=(node,parentClassName)=>{
    let current = node 
    while(current!==null){
        if (current.classList.contains(parentClassName)){
            return current
        }
        else{
            current = current.parentNode
        }
    }
    return false

}