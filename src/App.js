import React, { Component } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import CardActions from '@material-ui/core/CardActions';
import LinearProgress from '@material-ui/core/LinearProgress';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Badge from '@material-ui/core/Badge';

import './App.css';

const URLs={
  base: 'http://localhost:8005/',
  products: 'products',
  stores: 'stores',
  stock: 'stock'
}

const HeaderComponent = props => {
  let storeSelector = '';
  if(props.stores && props.stores.length > 0 ){
    storeSelector =   <form className="" autoComplete="off">
    <FormControl className="formControl">
      <InputLabel htmlFor="store-selector">Your Store</InputLabel>
      <Select
        value={props.selectedStore}
        onChange={props.onStoreChange}
        inputProps={{
          name: 'store',
          id: 'store-selector',
        }}
      >
      <MenuItem value="">
          <em>None</em>
      </MenuItem>
      {
        props.stores.map(store => (
        <MenuItem value={store.id}>{store.name} - ({store.address_line_1})</MenuItem>          
        ))
      }
      </Select>
    </FormControl>
  </form>;
  }


  return (
    <AppBar position="fixed" color="default">
    <Toolbar>
      <Typography variant="title" color="inherit">
        My LCBO
      </Typography>
      <TextField
        id="standard-full-width"
        style={{ margin: 16 }}
        placeholder="Search here"
        fullWidth
        margin="normal"
        InputProps={{
          startAdornment: <InputAdornment position="start"><i className="material-icons">local_drink</i></InputAdornment>,
        }}
        InputLabelProps={{
          shrink: true,
        }}
        onChange={props.onChange}
      />
      <TextField
          id="outlined-dense"
          value={props.postalCode}
          placeholder="Postal Code"
          className="dense"
          onChange={props.onPostalCodeChange}
          InputProps={{
            startAdornment: <InputAdornment position="start"><i className="material-icons">local_post_office</i></InputAdornment>,
          }}
          InputLabelProps={{
            shrink: true,
          }}
      />
      {storeSelector}
    </Toolbar>
  </AppBar> 
  )
};

const ProductListComponent = (props) => {
  return (
    <div className="layout cardGrid">
        <Grid container spacing={40}>
          {props.products
          .map(product => {
            let price = product.price_in_cents;
            price = price / 100;
            product.price_in_dollars = price.toLocaleString("en-CA", {style:"currency", currency:"CAD"});   
            return product;  
          })
          .map(card => (
            <Grid item key={card.id} sm={6} md={4} lg={3}>
              <Card className="card">
                <CardMedia
                  className="cardMedia"
                  image={card.image_url}
                  title={card.name}
                />
                <CardContent className="cardContent">
                  <Typography gutterBottom variant="headline" component="h2">
                  {card.name}
                  </Typography>
                  <Typography>
                  {card.tasting_note} (From: {card.origin})
                  </Typography>
                  <Typography variant="body2">
                  {card.alcohol_content/100}% good stuff
                  </Typography>
                </CardContent>
                <CardActions>
                <Typography variant="title" align="right">
                  {card.price_in_dollars}
                </Typography>
                <Typography variant="subheading" gutterBottom>
                  ({card.package})
                </Typography>
                {
                  card.stock && card.stock.quantity && (
                    <Badge className="badge" color="primary" badgeContent={card.stock.quantity}>
                    <Typography variant="button" gutterBottom>
                      Stock
                    </Typography>
                    </Badge>
                  )
                }
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
    </div>
  )
};

class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      products: [],
      stores: [],
      selectedStore: 0,
      searchTerm: '',
      postalCodeSearchTerm: ''
    };
  }

  componentDidMount() {
    const postalCode = localStorage.getItem('LCBOPostalCode');
    this.getProducts();
    this.getStores(postalCode);
  }

  getStores(postalCode){
    fetch(`${URLs.base}${URLs.stores}?searchText=${postalCode}`)
      .then(response => response.json())
      .then(data => this.setState({ stores: data.result , postalCodeSearchTerm: postalCode}))
      .catch(err => console.log(err));
  }

  getProducts(){
    fetch(`${URLs.base}${URLs.products}?searchText=${this.state.searchTerm}&store=${this.state.selectedStore}`)
    .then(response => response.json())
    .then(data => {
      this.setState({ products: data.result });
      this.getStock();
    })
    .catch(err => console.log(err));  
  }

  getStock(){
    const productIds = this.state.products.map(product => product.id);
    fetch(`${URLs.base}${URLs.stock}`, {
      method: 'post',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        store: this.state.selectedStore,
        productIds
      })
    }).then(res=>res.json())
      .then(stock => {
        let {products} = this.state;
        products.map(product => {
          product.stock = stock[product.id]
        })
        this.setState({ products })
      });
  }

  handleSearch = event => {
    this.setState({ searchTerm: event.target.value });
    this.getProducts();
  }

  handleStoreChange = event => {
    this.setState({ selectedStore: event.target.value });
    this.getProducts();
  }

  handlePostalCodeChange = event => {
    let postalCode = event.target.value;
    localStorage.setItem('LCBOPostalCode', postalCode);
    this.getStores(postalCode);
  }

  render() {
    const {products, stores, selectedStore, postalCodeSearchTerm } = this.state;
    let body;
    
    if(products.length > 0){
      body = <ProductListComponent products={products}></ProductListComponent>;
    }
    else{
      body = <div className="progress-bar"><LinearProgress /></div>;
    }
    return (
      <div>
        <HeaderComponent 
          stores={stores} 
          selectedStore = {selectedStore} 
          postalCode = {postalCodeSearchTerm}
          onStoreChange={this.handleStoreChange}
          onPostalCodeChange={this.handlePostalCodeChange}
          onChange={this.handleSearch}>
        </HeaderComponent>
        {body}
    </div> 
    );
  }
}

export default App;
