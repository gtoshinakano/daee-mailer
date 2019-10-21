import React from 'react';
import {Grid, Segment, List, Header, Icon, Form, Button} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'
import axios from 'axios'
import Iframe from './IFrameComponent'
import ReactHtmlParser from 'react-html-parser';

const meses = [
  {key: 1, text: "Janeiro", value: 1},
  {key: 2, text: "Fevereiro", value: 2},
  {key: 3, text: "Março", value: 3},
  {key: 4, text: "Abril", value: 4},
  {key: 5, text: "Maio", value: 5},
  {key: 6, text: "Junho", value: 6},
  {key: 7, text: "Julho", value: 7},
  {key: 8, text: "Agosto", value: 8},
  {key: 9, text: "Setembro", value: 9},
  {key: 10, text: "Outubro", value: 10},
  {key: 11, text: "Novembro", value: 11},
  {key: 12, text: "Dezembro", value: 12}
]

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
      selectedDir: "",
      selectedRefM: 1,
      selectedRefY: new Date().getFullYear(),
      mailbody: "",
      typedVenc: ""

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

  handleChange = (e, { name, value }) => this.setState({ [name]: value }, this.generateAutoText)

  getPossibleDirs = () => {
    const toret = Object.entries(this.state.dirData).map(a => {
      return a[1]
    }).filter(b => {
      return b.telefones.hasOwnProperty(this.state.selectedVenc)
    })
    return toret.map(r => {
      return {key: r.sigla, text: r.sigla + " - " + r.diretoria, value: r.sigla}
    })
  }

  generateAutoText = () => {
    const linhas = (this.state.dirData[this.state.selectedDir].telefones[this.state.selectedVenc]) ? this.state.dirData[this.state.selectedDir].telefones[this.state.selectedVenc] : []
    let text = ""
    if(linhas.length > 0)
      text = '<b>Senhor Diretor da '+ this.state.selectedDir +',</b><br /><p>Em observância ao Item I do Artigo 4º da Portaria DAEE-389, de 03/02/2016, anexamos ao presente correio eletrônico a(s) conta(s) digitalizada(s) da(s) linha(s):<br /> '+linhas.join("<br />")+'<br />referente(s) ao mês de <b>'+ meses[this.state.selectedRefM -1].text + ' de ' + this.state.selectedRefY +'</b>, instalada(s) em unidade(s) dessa Diretoria, com vencimento em '+ this.state.typedVenc +', para que seja(m) ratificada(s) por Vossa Senhoria.</p><p>A ratificação poderá ser feita  no próprio corpo deste correio eletrônico e enviada como resposta para avelez@sp.gov.br.</p><p>Se houverem ligações particulares a serem ressarcidas, o depósito deverá ser feito na conta "C" do DAEE no Banco do Brasil S/A - 001 - Ag. 1897-X - Conta Corrente nº139.572-6.</p><p>.</p>'
    else
      text = "ERRO: Selecione uma diretoria que tenha contas com a data de vencimento selecionada."

    this.setState({mailbody: text})
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
          <Grid.Column width="6" stretched>
            <Iframe src={this.state.host+'/serve-pdf/'+this.state.pdf} height="100%" width="100%" title="conta"
            />
          </Grid.Column>
          <Grid.Column width="8">
          <Form size="big">
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
                name="selectedDir"
                width="10"
              />
            </Form.Group>
            <Form.Field
              label="Data do Vencimento"
              control={Form.Input}
              maxLength="10"
              onChange={this.handleChange}
              name="typedVenc"
              placeholder="Digite a data de vencimento da conta"
            />
            <Form.Group>
              <Form.Field
                label="Mês de Referência"
                control={Form.Select}
                options={meses}
                value={this.state.selectedRefM}
                onChange={this.handleChange}
                name="selectedRefM"
                width="8"
              />
              <Form.Field
                label="Ano de Referência"
                control={Form.Input}
                type="number"
                value={this.state.selectedRefY}
                onChange={this.handleChange}
                name="selectedRefY"
                width="8"
              />
            </Form.Group>
            <Form.Field>
              <label>Para: </label>
              {this.state.selectedDir ? this.state.dirData[this.state.selectedDir].email : "SELECIONE A DIRETORIA PRIMEIRO"}
            </Form.Field>
            <Form.Field>
              <label>Assunto: </label>
              Atestado de contas telefônicas ref. {meses[this.state.selectedRefM-1].text} de {this.state.selectedRefY} - {this.state.selectedDir}
            </Form.Field>
            <Form.Field>
              <label>Anexo: </label>
              {this.state.pdf}
            </Form.Field>
            <Form.Field
              label="Corpo do Email"
            />
            <Segment size="big" placeholder>
              { ReactHtmlParser(this.state.mailbody) }
            </Segment>
            <Button type='submit' fluid color="green" size="big"
              disabled={
                (this.state.typedVenc.length !== 10) ||
                !(this.state.dirData[this.state.selectedDir].telefones[this.state.selectedVenc])
              }
            >Enviar email com as contas</Button>
          </Form>
          </Grid.Column>
        </Grid>
      </Segment>
    );
  }
}

export default App;
