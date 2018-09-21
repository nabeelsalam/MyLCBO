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

import './App.css';

const URLs={
  base: 'http://localhost:8005/',
  products: 'products'
}

const HeaderComponent = props => {
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
            product.price_in_dollars = price.toLocaleString("en-US", {style:"currency", currency:"USD"});   
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
                  {card.tasting_note}
                  </Typography>
                </CardContent>
                <CardActions>
                <Typography variant="title" align="right">
                  {card.price_in_dollars}
                </Typography>
                <Typography variant="subheading" gutterBottom>
                  ({card.package})
                </Typography>
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
      products: []
    };
  }

  componentDidMount() {
    fetch(`${URLs.base}${URLs.products}`)
      .then(response => response.json())
      .then(data => this.setState({ products: data.result }))
      .catch(err => console.log(err));
  }

  handleChange = event => {
    fetch(`${URLs.base}${URLs.products}?searchText=${event.target.value}`)
      .then(response => response.json())
      .then(data => this.setState({ products: data.result }))
      .catch(err => console.log(err));  
  }

  render() {
    const {products} = this.state;
    let body;
    if(products.length > 0){
      body = <ProductListComponent products={products}></ProductListComponent>;
    }
    else{
      body = <div className="progress-bar"><LinearProgress /></div>;
    }
    return (
      <div>
        <HeaderComponent onChange={this.handleChange}></HeaderComponent>
        {body}
    </div> 
    );
  }
}

export default App;
