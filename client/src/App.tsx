import React, { useState, useEffect } from 'react';
import './App.css';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Upload, Button, Input, Row, Col, Form, Layout } from 'antd';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import axios from 'axios';

const { Dragger } = Upload;
const { Header } = Layout

function App() {

  const [email, setEmail] = useState('');

  const [count, setCount] = useState(0);

  const MySwal = withReactContent(Swal)

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const COLUMN_STYLE = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  } as React.CSSProperties;

  const onFinish = (values: any) => {
    axios.get(`${window.config.requestURL}/get_status/${values.ticketID}`)
    .then((res: any) => {
      MySwal.fire({
        icon: 'info',
        title: `Ticket ${values.ticketID} status: ${res.data.status}`,
      });
    })
    .catch((err: any) => {
      MySwal.fire({
        icon: 'error',
        title: `Get ticket ${values.ticketID} status failed.`,
        text: err,
      });
    })
  }

  const props: UploadProps = {
    name: 'file',
    multiple: true,
    customRequest: (options) => {
      const { onSuccess, onError, file } = options;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('email', email);
  
      const config = {
        headers: {
          'content-type': 'multipart/form-data',
        }
      };
  
      axios.post(`${window.config.requestURL}/inference`, formData, config)
        .then((response) => {
          onSuccess?.(response);
        })
        .catch((error) => {
          onError?.(error);
        });
    },
    onChange(info: any) {
      console.log(info);
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        console.log(info);
        MySwal.fire({
          icon: 'success',
          title: `${info.file.name} file uploaded successfully.`,
          html: <>
            <p>Your ticket ID: <b>{info.file.response.data.ticketID}</b></p>
            <p>Please wait for our email containing the result.</p>
            <p>You can search for ticket status anytime.</p>
          </>,
        });
      } else if (status === 'error') {
        MySwal.fire({
          icon: 'error',
          title: `${info.file.name} file upload failed.`,
          text: info.file.error,
        });
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  useEffect(() => {
    axios.get(`${window.config.requestURL}/count`).then(res => {
      setCount(res.data.count);
    })
  }, []);

  return (
    <div className="App">
      <Header
        className="app-header"
        style={{
          backgroundColor: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          lineHeight: '16px',
          overflow: 'hidden',
          border: '1px solid grey'
        }}
      >
        <h1>Enunci</h1>
        <h2><i>Accurate English pronunciation analysis</i></h2>
      </Header>
      <Row gutter={16}>
        <Col 
          span={8} 
          className="gutter-row"
          style={{...COLUMN_STYLE, backgroundColor: 'white' }}
        >
          <h2>Upload your speech audio</h2>
          <Form>
            <Form.Item
                label="Email: "
                name="email"
                rules={[{ required: true, message: 'Please input your email!' }]}
              >
                <Input
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                  style={{ width: '500px', marginBottom: '16px' }}
                />
            </Form.Item>
            <Form.Item>
              <Dragger {...props} style={{ width: '100%' }}>
                <div style={{ height: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <p>
                    Input your email and upload your speech audio file
                  </p>
                  <InboxOutlined style={{ fontSize: '60px', color: 'gray' }}/>
                  <h3 className="ant-upload-text">Click or drag file to this area to upload</h3>
                  <h3 className="ant-upload-hint">
                    Limit 200MB perfile * MP3, WAV, FLAC, M4A
                  </h3>
                </div>
              </Dragger>
            </Form.Item>
            <Form.Item wrapperCol={{ span: 24 }}>
              <Button type="primary" htmlType="submit" style={{ width: '100%', margin: 0 }}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Col>
        <Col span={4} className="gutter-row" style={COLUMN_STYLE}>
          <h2>Check your ticket status</h2>
          <Form name="ticketStatus" onFinish={onFinish}>
            <Row gutter={8}>
              <Col span={16}>
                <Form.Item
                  label="Ticket ID:"
                  name="ticketID"
                  rules={[{ required: true, message: 'Please input your ticket ID!' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Button type="primary" htmlType="submit" style={{ margin: '0px'}}>
                  Submit
                </Button>
              </Col>
            </Row>
          </Form>
        </Col>
        <Col className="gutter-row" span={12}>
          <h2>Total number of submissions:</h2>
          <h1>{count}</h1>
        </Col>
      </Row>
    </div>
  );
}

export default App;
