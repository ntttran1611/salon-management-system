import { serviceList } from "../data/service-list.js";

const listContainer = document.querySelector('main');
const prevBtn = document.getElementById('prev');
const nextBtn = document.querySelector('.next');
const listComponent = document.querySelector('.service-list');


serviceList.forEach((service) => {
    const listItem = document.createElement('li');
    listItem.setAttribute('id', service.id);

    const itemImage = document.createElement('img');
    itemImage.setAttribute('rel', 'service demo');
    itemImage.setAttribute('src', service.imageURL);
    itemImage.setAttribute('height', '150px');
    itemImage.setAttribute('width', '200px');

    const itemContainter = document.createElement('div');
    itemContainter.setAttribute('class', 'description');

    const itemTitle = document.createElement('h3');
    const titleContent = document.createTextNode(`${service.title} | $${service.price}`);
    itemTitle.appendChild(titleContent);

    const itemDes = document.createElement('p');
    const descriptionContent = document.createTextNode(`${service.description}, ${(service.keyword).toLocaleUpperCase()}`)
    itemDes.appendChild(descriptionContent);
    
    itemContainter.appendChild(itemTitle);
    itemContainter.appendChild(itemDes);

    listItem.appendChild(itemImage);
    listItem.appendChild(itemContainter);

    listComponent.appendChild(listItem);
}),

prevBtn.addEventListener('click', ()=>{
    listComponent.scrollLeft += -(listComponent.offsetWidth);
})

nextBtn.addEventListener('click', ()=>{
    listComponent.scrollLeft += (listComponent.offsetWidth);
})