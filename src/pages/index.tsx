import './index.less';

import { useEffect, useState } from 'react';
import {
  ClearOutlined,
  DownloadOutlined,
  EditOutlined,
  GithubOutlined,
  PlusOutlined,
  RobotOutlined,
  SendOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
  List,
  message,
  Modal,
  Popconfirm,
  Row,
  Tag,
} from 'antd';
import { io } from 'socket.io-client';
import moment from 'moment';

const { Meta } = Card;
const { TextArea } = Input;

export default function IndexPage() {
  const [inputValue, setInputValue] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [socketUrl, setSocketUrl] = useState(
    localStorage.getItem('SOCKET_URL') || window.location.origin,
  );
  const [socket, setSocket] = useState(
    io(socketUrl, {
      reconnection: false,
    }),
  );
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const [sessionList, setSessionList] = useState<Array<any>>([
    {
      name: 'new#' + moment().format('YYYYMMDD#HHmmss#SSS'),
      messages: [],
    },
  ]);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [isUpdateSessionList, setIsUpdateSessionList] = useState(true);
  const [currentSession, setCurrentSession] = useState<any>({
    name: 'new#' + moment().format('YYYYMMDD#HHmmss#SSS'),
    messages: [],
  });

  useEffect(() => {
    console.log('# init from local storage');
    const sessionListFromLocalStorage = localStorage.getItem('SESSION_LIST');
    if (sessionListFromLocalStorage !== null) {
      const currentSessionList = JSON.parse(sessionListFromLocalStorage);
      setSessionList(currentSessionList);
      setIsUpdateSessionList(true);
      setCurrentSession(currentSessionList[0]);
    }
  }, []);

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

    socket.on('chat-reply', (message) => {
      console.log('socket receive chat-reply: ' + message);
      setIsUpdateSessionList(true);
      setCurrentSession((session: any) => {
        return {
          ...session,
          messages: [...session.messages, message],
        };
      });
    });

    return () => {
      socket.close();
      console.log('socket disconnected');
    };
  }, [socket]);

  // save session list on current session change
  useEffect(() => {
    console.log('[save] currentSession');
    // 如果只更新 sessionIndex，则不需要更新 sessionList
    if (isUpdateSessionList) {
      setSessionList((sessionList) => {
        const currentSessionList = [...sessionList];
        currentSessionList[sessionIndex] = { ...currentSession };
        return currentSessionList;
      });
    }
  }, [currentSession]);

  // save session list
  useEffect(() => {
    console.log('[save] sessionList');
    localStorage.setItem('SESSION_LIST', JSON.stringify(sessionList));
  }, [sessionList]);

  // scroll to bottom
  useEffect(() => {
    console.log('[scroll] to bottom');
    const messageContent = document.getElementsByClassName('card-content')[1];
    if (messageContent) {
      messageContent.scrollTo({
        top: messageContent.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [currentSession.messages.length]);

  const addNewSession = () => {
    const initSession = {
      name: 'new#' + moment().format('YYYYMMDD#HHmmss#SSS'),
      messages: [],
    };
    setSessionList((sessionList) => [{ ...initSession }, ...sessionList]);
    setSessionIndex(0);
    setIsUpdateSessionList(true);
    setCurrentSession({ ...initSession });
  };

  const deleteCurrentSession = (index: any) => {
    console.log('[delete] sessionIndex: ' + index);
    const currentSessionList = [...sessionList];
    currentSessionList.splice(index, 1);
    if (currentSessionList.length > 0) {
      setSessionList(currentSessionList);
    } else {
      const initSession = {
        name: 'new#' + moment().format('YYYYMMDD#HHmmss#SSS'),
        messages: [],
      };
      setSessionList([{ ...initSession }]);
    }
  };

  const clearSessionList = () => {
    console.log('[clear] session list');
    const initSession = {
      name: 'new#' + moment().format('YYYYMMDD#HHmmss#SSS'),
      messages: [],
    };
    setSessionList([{ ...initSession }]);
    changeSessionIndex(0);
  };

  const changeSessionIndex = (index: any) => {
    console.log('[change] sessionIndex: ' + index);
    setSessionIndex(index);

    setIsUpdateSessionList(false);
    setCurrentSession(sessionList[index]);
  };

  const [form] = Form.useForm();

  const onSetURLIsOK = () => {
    const formSocketUrl = form.getFieldValue('socketUrl');
    setSocketUrl(formSocketUrl);
    setSocket(io(formSocketUrl, { reconnection: false }));
    localStorage.setItem('SOCKET_URL', formSocketUrl);
    setModalVisible(false);
  };

  const handleSend = () => {
    const value = inputValue;
    console.log('send: ' + value);
    // send message to api
    if (socketStatus === 'connected') {
      if (value.trim().length > 0) {
        const updatedSession = {
          ...currentSession,
          messages: [
            ...currentSession.messages,
            { role: 'user', content: value },
          ],
        };

        setIsUpdateSessionList(true);
        setCurrentSession((session: any) => {
          return {
            ...session,
            messages: [...session.messages, { role: 'user', content: value }],
          };
        });

        socket.emit('chat-request', updatedSession);

        setInputValue('');
      } else {
        message.error('please input message');
      }
    } else {
      message.error('please connect socket url');
    }
  };

  return (
    <div>
      <Row className="page-body">
        {/*左边卡片*/}
        <Col xs={0} md={4} lg={6}>
          <Card
            hoverable
            className="left-card"
            title="Session"
            extra={
              <Button
                shape="circle"
                icon={<PlusOutlined />}
                onClick={addNewSession}
              />
            }
            actions={[
              <Popconfirm
                title="Confirm to DELETE all session?"
                onConfirm={clearSessionList}
                okText="ok"
                cancelText="cancel"
              >
                <Button
                  ghost
                  className="full-button"
                  type="primary"
                  icon={<ClearOutlined />}
                  size={'large'}
                  danger
                >
                  Clear
                </Button>
              </Popconfirm>,
            ]}
          >
            <div className="card-content">
              <List
                bordered
                itemLayout="horizontal"
                dataSource={sessionList}
                renderItem={(item, index) => (
                  <List.Item
                    style={{
                      backgroundColor:
                        sessionIndex === index ? '#e6f4ff' : 'white',
                    }}
                    actions={[
                      <Button
                        ghost
                        type="primary"
                        icon={<EditOutlined />}
                        size={'small'}
                        onClick={() => {
                          message.warning('to do...');
                        }}
                      ></Button>,
                      <Popconfirm
                        title="Confirm to DELETE this session?"
                        onConfirm={() => deleteCurrentSession(index)}
                        okText="ok"
                        cancelText="cancel"
                      >
                        <Button
                          ghost
                          type="primary"
                          icon={<ClearOutlined />}
                          size={'small'}
                          danger
                        ></Button>
                      </Popconfirm>,
                    ]}
                    onClick={() => changeSessionIndex(index)}
                  >
                    <List.Item.Meta title={item.name} />
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </Col>

        {/*中间卡片*/}
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
                <TextArea
                  autoSize={{ minRows: 1, maxRows: 6 }}
                  size={'large'}
                  className="human-input-message"
                  placeholder="please input question..."
                  value={inputValue}
                  onChange={(event) => setInputValue(event.currentTarget.value)}
                />
                <Button
                  className="human-input-message-button"
                  type="primary"
                  size={'large'}
                  icon={<SendOutlined />}
                  onClick={handleSend}
                >
                  <span id="human-input-message-button-text">Send</span>
                </Button>
              </div>,
            ]}
          >
            <div className="card-content">
              {currentSession.messages.map(
                (message: { role: string; content: string }, index: number) => (
                  <Meta
                    key={index}
                    className={
                      message.role === 'assistant'
                        ? 'left-message-card'
                        : 'right-message-card ant-card-rtl'
                    }
                    avatar={
                      <Avatar
                        icon={
                          message.role === 'assistant' ? (
                            <RobotOutlined />
                          ) : (
                            <UserOutlined />
                          )
                        }
                        size={'large'}
                      />
                    }
                    title={message.role === 'assistant' ? 'Assistant' : 'User'}
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

        {/*右边卡片*/}
        <Col xs={0} md={4} lg={6}>
          <Card
            hoverable
            className="right-card"
            title={'Knowledge'}
            extra={
              <Button
                shape="circle"
                icon={<DownloadOutlined />}
                onClick={() => {
                  message.warning('to do...');
                }}
              />
            }
            actions={[
              <Button
                ghost
                className="full-button"
                type="primary"
                icon={<EditOutlined />}
                size={'large'}
                onClick={() => {
                  message.warning('to do...');
                }}
              >
                Edit
              </Button>,
            ]}
          >
            <div className="card-content">
              <TextArea
                placeholder="please input prompt..."
                style={{ height: '100%' }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
