function currencyFormat(price){
  return new Intl.NumberFormat('ru-RU', {
    currency: 'rub',
    style: 'currency'
  }).format(price);
}
function dateFormat(date){
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year:'numeric',
    hour:'2-digit',
    minute:'2-digit',
    second:'2-digit'

  }).format(new Date(date));
}
document.querySelectorAll('.date').forEach(node => {
  node.textContent = dateFormat(node.textContent);
})
document.querySelectorAll('.price').forEach(node => {
  node.textContent = currencyFormat(node.textContent);
})

const $cart = document.querySelector('.cart');
if ($cart) {
  $cart.addEventListener('click', onDeleteCartItemClick);
}

function onDeleteCartItemClick({target}) {
  if (target.classList.contains('btn-delete-cart-item')) {
    const id=target.dataset.id;
    const csrf=target.dataset.csrf
    fetch('/cart/remove/'+id,{
      method:'delete',
    headers:{
        'X-CSRF-TOKEN':csrf
    }
    }).then(res=>res.json()).then(cart=>{
        if (cart.courses.length){
          const cartItemsTemplate=cart.courses.map(course=>{

            return `
                <div class="name">${course.title}</div>
                <div class="count">${course.count}</div>
                <div class="price">${currencyFormat(course.price)}</div>
                <div class="price">${currencyFormat(course.total)}</div>
                <div class="action">
                    <button class="btn btn-small btn-delete-cart-item" data-id="${course._id}">Delete</button>
                </div>
`
          }).join('');
          console.log(cartItemsTemplate)

          $cart.querySelector('.cart-body').innerHTML='';
          $cart.querySelector('.cart-body').insertAdjacentHTML('afterbegin',cartItemsTemplate);
          $cart.querySelector('.cart-pagination>.price').textContent=currencyFormat(cart.totalPrice);

        }else {
          $cart.innerHTML='Cart ie empty';
        }
    });
  }
}

M.Tabs.init(document.querySelectorAll('.tabs'));
