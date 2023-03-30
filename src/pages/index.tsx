import './index.less';

import { useState, useEffect } from 'react';
import {
  SettingOutlined,
  GithubOutlined,
  UserOutlined,
  RobotOutlined,
  SendOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  Row,
  Col,
  Card,
  Button,
  Avatar,
  Input,
  message,
  Modal,
  Form,
  Tag,
  Select,
  Popconfirm,
} from 'antd';
import { io } from 'socket.io-client';

const { Meta } = Card;
const { TextArea } = Input;

export default function IndexPage() {
  const [messages, setMessages] = useState<any | []>(
    sessionStorage.getItem('MESSAGES') || [],
  );
  const [modelType, setModelType] = useState(
    sessionStorage.getItem('MODEL_TYPE') || 'JointNLU',
  );
  const [inputValue, setInputValue] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [socketUrl, setSocketUrl] = useState(
    sessionStorage.getItem('SOCKET_URL') || window.location.origin,
  );
  const [socket, setSocket] = useState(
    io(socketUrl, {
      reconnection: false,
    }),
  );
  const [socketStatus, setSocketStatus] = useState('disconnected');

  useEffect(() => {
    socket.on('connect', () => {
      setSocketStatus('connected');
      message.success('connected to server: ' + socketUrl);
      console.log('socket connected');
    });

    socket.on('connect_error', (reason) => {
      message.error('socket connect error: ' + reason);
      console.log('socket connect error: ' + reason);
    });

    socket.on('error', (reason) => {
      message.error('socket error: ' + reason);
      console.log('socket error: ' + reason);
    });

    socket.on('disconnect', (reason) => {
      setSocketStatus('disconnected');
      message.error('disconnected from server: ' + socketUrl);
      console.log('socket disconnect: ' + reason);
    });

    socket.on('chat-reply', (msg) => {
      console.log('socket receive chat-reply: ' + msg);
      setMessages((messages: any) => [...messages, msg]);
    });

    return () => {
      socket.close();
      console.log('socket disconnected');
    };
  }, [socket]);

  // save session messages
  useEffect(() => {
    if (messages.length === 0) {
      const contents = JSON.parse(sessionStorage.getItem('MESSAGES') ?? '[]');
      if (contents.length > 0) {
        setMessages(contents);
      }
    } else {
      console.log('save messages to session storage');
      sessionStorage.setItem('MESSAGES', JSON.stringify(messages));
    }
  }, [messages]);

  // scroll to bottom
  useEffect(() => {
    const messageContent =
      document.getElementsByClassName('message-content')[0];
    if (messageContent) {
      messageContent.scrollTo({
        top: messageContent.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages.length]);

  const [form] = Form.useForm();

  const onSetURLIsOK = () => {
    const formSocketUrl = form.getFieldValue('socketUrl');
    setSocketUrl(formSocketUrl);
    setSocket(io(formSocketUrl, { reconnection: false }));
    sessionStorage.setItem('SOCKET_URL', formSocketUrl);
    setModalVisible(false);
  };

  const handleSend = () => {
    const value = inputValue;
    console.log('send: ' + value);
    // send message to api
    if (socketStatus === 'connected') {
      if (value.trim().length > 0) {
        const message = { role: 'user', content: value };
        setMessages((messages: any) => [...messages, message]);
        const sendData = {
          modelType: modelType,
          messages: [...messages, message],
        };
        socket.emit('chat-request', sendData);
        setInputValue('');
      } else {
        message.error('please input message');
      }
    } else {
      message.error('please connect socket url');
    }
  };

  const handleClear = () => {
    console.log('clear!');
    sessionStorage.removeItem('MESSAGES');
    setMessages([]);
  };

  const handleModelTypeChange = (value: string) => {
    setModelType(value);
    sessionStorage.setItem('MODEL_TYPE', value);
  };

  return (
    <div>
      <Row className="card-body">
        <Col xs={0} md={4} lg={6}></Col>
        <Col xs={24} md={16} lg={12}>
          <Modal
            title="Settings"
            centered
            destroyOnClose
            open={modalVisible}
            onOk={onSetURLIsOK}
            onCancel={() => setModalVisible(false)}
            width={400}
          >
            <Form
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              form={form}
              initialValues={{ socketUrl: socketUrl }}
            >
              <Form.Item
                label="SOCKET_URL"
                name="socketUrl"
                rules={[{ message: 'please input socket url' }]}
              >
                <Input allowClear />
              </Form.Item>
            </Form>
          </Modal>
          <Card
            title={
              <div>
                <Button
                  shape="circle"
                  icon={<GithubOutlined />}
                  href={'https://github.com/Ailln/fuzi-bot'}
                />
                <span style={{ marginLeft: 10 }}>{'FUZI-BOT'}</span>
              </div>
            }
            hoverable
            className="card"
            extra={
              <div>
                <Tag color={socketStatus === 'connected' ? 'success' : 'error'}>
                  {socketStatus}
                </Tag>
                <Button
                  shape="circle"
                  icon={<SettingOutlined />}
                  onClick={() => setModalVisible(true)}
                />
              </div>
            }
            actions={[
              <div className="human-input">
                <div>
                  <TextArea
                    autoSize={{ minRows: 1, maxRows: 6 }}
                    size={'large'}
                    className="human-input-message"
                    placeholder="please input question..."
                    value={inputValue}
                    onChange={(event) =>
                      setInputValue(event.currentTarget.value)
                    }
                  />
                </div>
                <div>
                  <Select
                    className="human-input-select"
                    defaultValue={modelType}
                    onChange={handleModelTypeChange}
                    size="large"
                    options={[
                      { value: 'JointNLU', label: 'JointNLU' },
                      { value: 'ChatGLM-6B', label: 'ChatGLM-6B' },
                      { value: 'ChatGPT', label: 'ChatGPT' },
                    ]}
                  />
                  <Popconfirm
                    title="确认要「清除」所有聊天记录吗？"
                    onConfirm={handleClear}
                    okText="确认"
                    cancelText="取消"
                  >
                    <Button
                      ghost
                      className="human-input-clear-button"
                      type="primary"
                      icon={<DeleteOutlined />}
                      size={'large'}
                      danger
                    >
                      Clear
                    </Button>
                  </Popconfirm>
                  <Button
                    className="human-input-message-button"
                    type="primary"
                    size={'large'}
                    icon={<SendOutlined />}
                    onClick={handleSend}
                  >
                    Send
                  </Button>
                </div>
              </div>,
            ]}
          >
            <div className="message-content">
              {messages.map(
                (message: { role: string; content: string }, index: number) => (
                  <Meta
                    key={index}
                    className={
                      message.role === 'bot'
                        ? 'left-message-card'
                        : 'right-message-card ant-card-rtl'
                    }
                    avatar={
                      <Avatar
                        icon={
                          message.role === 'bot' ? (
                            <RobotOutlined />
                          ) : (
                            <UserOutlined />
                          )
                        }
                        size={'large'}
                      />
                    }
                    title={message.role === 'bot' ? 'Bot' : 'User'}
                    description={message.content}
                  />
                ),
              )}
            </div>
          </Card>
          <div className="footer">
            Created by <span className="footer-bold">Ailln</span> at{' '}
            {new Date().getFullYear()}.
          </div>
        </Col>
        <Col xs={0} md={4} lg={6}></Col>
      </Row>
    </div>
  );
}
