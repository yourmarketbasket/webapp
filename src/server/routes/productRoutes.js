const express = require('express');
const router = express.Router();
const ProductService = require('../Services/productServices')

router.post('/addToCart', async(req, res)=>{
    const addtocart = await ProductService.addToCart(req.body)
    res.json(addtocart)   

})

router.post('/availableQttyForUser', async(req, res)=>{
    res.json(await ProductService.availableProductQuantityForUser(req.body))

});
 
router.post('/numOfItemsInCart', async(req, res)=>{
    res.json({num: await ProductService.numberOfItemsInCart(req.body)})
})

module.exports = router;