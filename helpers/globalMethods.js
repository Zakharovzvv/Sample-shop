
function serializeCart({items}){
  return items.map(item=>({
    ...item.courseId._doc,
    count:item.count,
    id:item.courseId.id,
    total:item.courseId.price*item.count

  }))
}

function calculateTotalPrice(courses){
  return courses.reduce((acc,item)=>{
    return acc+=item.price*item.count
  },0);
}
module.exports={serializeCart,calculateTotalPrice}
