import React from 'react';
import {Grid, Segment, List, Header, Icon, Form, Button} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'
import axios from 'axios'
import Iframe from './IFrameComponent'

class App extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      host: 'http://localhost:4000',
      fileList: [],
      pdf: "",
      dirData: {},
      diretorias: [],
      vencimentos: [],
      selectedVenc: "venc1",
    }
  }


  componentDidMount(){
    axios.defaults.baseURL = this.state.host;
    axios.defaults.headers.post['Content-Type'] ='application/json;charset=utf-8';
    axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
    this.getPdfList()
    axios.get('get-dir-data').then(res =>
      {
        const vencimentos = Object.entries(res.data).map(o => {
          return o[1].telefones
        }).map(t => Object.keys(t))
        const venc = [].concat.apply([], vencimentos).filter((value, index, self) => self.indexOf(value) === index)
        this.setState({dirData: res.data, vencimentos: venc})
      }
    )
  }

  getPdfList = () => {
    axios.get('get-file-list')
    .then(res => this.setState({fileList: res.data, pdf: res.data[0]}))
    .catch(e => console.log(e))
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value }, console.log(this.state))

  getPossibleDirs = () => {
    const toret = Object.entries(this.state.dirData).map(a => {
      return a[1]
    }).filter(b => {
      return b.telefones.hasOwnProperty(this.state.selectedVenc)
    })
    console.log(toret)
    return toret.map(r => {
      return {key: r.sigla, text: r.sigla + " - " + r.diretoria, value: r.sigla}
    })
  }

  render() {
    return (
      <Segment basic>
        <Grid>
          <Grid.Column width="2">
            <List>
              { this.state.fileList.map(a => {
                return(
                  <List.Item
                    as="a" key={a}
                    onClick={()=>this.setState({pdf: a})}
                    active={this.state.pdf === a}
                  >
                    <List.Icon name='file' />
                    <List.Content>
                      <List.Header>{a}</List.Header>
                    </List.Content>
                  </List.Item>
                )
              })
              }
            </List>
            <Header as='h2' icon color="blue">
              <Icon name='arrow right' />
              <Header.Subheader>
                {this.state.pdf}
              </Header.Subheader>
            </Header>
          </Grid.Column>
          <Grid.Column width="7" stretched>

            <Iframe src={this.state.host+'/serve-pdf/'+this.state.pdf} height="100%" width="100%" title="conta"
            />
          </Grid.Column>
          <Grid.Column width="7">
          <Form>
            <Form.Group>
              <Form.Field
                label="Selecione o Vencimento"
                control={Form.Select}
                options={this.state.vencimentos.map(function(v){return {key: v, text: v.replace("venc", ''), value: v}})}
                name="selectedVenc"
                value={this.state.selectedVenc}
                onChange={this.handleChange}
                width="6"
              />
              <Form.Field
                label="Selecione a Diretoria"
                control={Form.Select}
                options={this.getPossibleDirs()}
                onChange={this.handleChange}
                width="10"
              />
            </Form.Group>


            <Form.Field>
              <label>Last Name</label>
              <input placeholder='Last Name' />
            </Form.Field>
            <Button type='submit'>Submit</Button>
          </Form>
          </Grid.Column>
        </Grid>
      </Segment>
    );
  }
}

export default App;
