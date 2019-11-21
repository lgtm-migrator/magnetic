import React from 'react'
import { Row, Col, Input, Affix, Card, Divider } from 'antd'
import { Route } from 'react-router-dom'
import { Base64 } from 'js-base64'

import Error from './error'
import Preview from './preview'
import { base64ToState } from './utils'


class Edit extends React.Component {
  constructor (props) {
    super(props)
    this.onCodeChange = this.onCodeChange.bind(this)
    this.onMermaidConfigChange = this.onMermaidConfigChange.bind(this)

    const {
      match: {
        params: { base64 }
      },
      location: { search }
    } = this.props
    this.json = base64ToState(base64, search)
    mermaid.initialize(this.json.mermaid)
  }

  onCodeChange (event) {
    const {
      history,
      match: { path }
    } = this.props
    console.log('Code change')
    this.json.code = event.target.value
    const base64 = Base64.encodeURI(JSON.stringify(this.json))
    history.push(path.replace(':base64', base64))
  }

  onKeyDown (event) {
    const keyCode = event.keyCode || event.which

    // 9 is key code for TAB
    if (keyCode === 9) {
      event.preventDefault()
      const TAB_SIZE = 4
      document.execCommand('insertText', false, ' '.repeat(TAB_SIZE))
    }
  }

  onMermaidConfigChange (event) {
    const str = event.target.value
    const {
      history,
      match: { path, url }
    } = this.props
    try {
      const config = JSON.parse(str)
      mermaid.initialize(config)
      this.json.mermaid = config
      const base64 = Base64.encodeURI(JSON.stringify(this.json))
      history.push(path.replace(':base64', base64))
    } catch (e) {
      const base64 = Base64.encodeURI(e.message)
      history.push(`${url}/error/${base64}`)
    }
  }

  render () {
    const {
      match: { url }
    } = this.props
    return (
      <div>
        <h1>Mermaid Live Editor</h1>
        <Divider />
        <Row gutter={16}>
          <Col span={8}>
            <Affix>
              <Card title='Code'>
                <Input.TextArea
                  autosize={{ minRows: 4, maxRows: 16 }}
                  value={this.json.code}
                  onChange={this.onCodeChange}
                  onKeyDown={this.onKeyDown}
                />
              </Card>
            </Affix>
            <Card title='Mermaid configuration'>
              <Input.TextArea
                autosize={{ minRows: 4, maxRows: 16 }}
                defaultValue={JSON.stringify(this.json.mermaid, null, 2)}
                onChange={this.onMermaidConfigChange}
                onKeyDown={this.onKeyDown}
              />
            </Card>
          </Col>
          <Col span={16}>
            <Route
              exact
              path={url}
              render={props => <Preview {...props} code={this.json.code} />}
            />
            <Route path={url + '/error/:base64'} component={Error} />
          </Col>
        </Row>
      </div>
    )
  }
}

export default Edit