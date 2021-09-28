export const getIncommingCallDialog = (
    callTypeInfo,
    acceptCallHandler,
    rejectCallHandler
) => {
    console.log("getting incoming call dialog.");

    // montando a caixa de dialogo
    const dialog = document.createElement('div');
    dialog.classList.add('dialog_wrapper');
    const dialogContent = document.createElement('div');
    dialogContent.classList.add('dialog_content');
    dialog.appendChild(dialogContent);

    // montando o título do dialogo de chamada
    const title = document.createElement('p');
    title.classList.add('dialog_title');
    title.innerHTML = `Incoming ${callTypeInfo} Call`;

    // montando o container da imagem da chamada
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('dialog_image_container');
    const image = document.createElement('img');
    const avatarImagePath = './utils/images/dialogAvatar.png';
    image.src = avatarImagePath;
    imageContainer.appendChild(image);

    // container de botões
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('dialog_button_container');

    // montando o botão de aceitar chamada
    const acceptCallButton = document.createElement('button');
    acceptCallButton.classList.add('dialog_accept_call_button');
    const acceptCallImg = document.createElement('img');
    acceptCallImg.classList.add('dialog_button_image');
    const acceptCallImgPath = './utils/images/acceptCall.png';
    acceptCallImg.src = acceptCallImgPath;
    acceptCallButton.append(acceptCallImg);
    buttonContainer.appendChild(acceptCallButton);

    // montando o botão de rejeitar chamada
    const rejectCallButton = document.createElement('button');
    rejectCallButton.classList.add('dialog_reject_call_button');
    const rejectCallImg = document.createElement('img');
    rejectCallImg.classList.add('dialog_button_image');
    const rejectCallImgPath = './utils/images/rejectCall.png';
    rejectCallImg.src = rejectCallImgPath;
    rejectCallButton.append(rejectCallImg);
    buttonContainer.appendChild(rejectCallButton);

    // adicionando a tala de dialogo
    // titulo, imagem e botões
    dialogContent.appendChild(title);
    dialogContent.appendChild(imageContainer);
    dialogContent.appendChild(buttonContainer);

    // evento de click no botão de aceitar chamada
    acceptCallButton.addEventListener('click', () => {
        acceptCallHandler();
    });

    // evento de click no botão de regeitar chamada
    rejectCallButton.addEventListener('click', () => {
        rejectCallHandler();
    });

    return dialog;
};

// montando a caixa para queme está fazendo a chamada
export const getCallingDialog = (rejectCallHandler) => {
    // montando a caixa de dialogo
    const dialog = document.createElement('div');
    dialog.classList.add('dialog_wrapper');
    const dialogContent = document.createElement('div');
    dialogContent.classList.add('dialog_content');
    dialog.appendChild(dialogContent);

    // montando o título
    const title = document.createElement('p');
    title.classList.add('dialog_title');
    title.innerHTML = `Calling`;

    // montando o container da imagem
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('dialog_image_container');
    const image = document.createElement('img');
    const avatarImagePath = './utils/images/dialogAvatar.png';
    image.src = avatarImagePath;
    imageContainer.appendChild(image);

    // montando o container dos bottões
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('dialog_button_container');

    // montando o botão de cancelar chamada
    const hangUpCallButton = document.createElement('button');
    hangUpCallButton.classList.add('dialog_reject_call_button');
    const hangUpCallImg = document.createElement('img');
    hangUpCallImg.classList.add('dialog_button_image');
    const rejectCallImgPath = './utils/images/rejectCall.png';
    hangUpCallImg.src = rejectCallImgPath;
    hangUpCallButton.append(hangUpCallImg);
    buttonContainer.appendChild(hangUpCallButton);

    // adicionando ao container de dialogo
    // titulo, imagem e botões
    dialogContent.appendChild(title);
    dialogContent.appendChild(imageContainer);
    dialogContent.appendChild(buttonContainer);

    return dialog;
};

// montando informações do dialogo para a resposta
export const getInfoDialog = (dialogTitle, dialogDescription) => {
    // montando a caixa de dialogo
    const dialog = document.createElement('div');
    dialog.classList.add('dialog_wrapper');
    const dialogContent = document.createElement('div');
    dialogContent.classList.add('dialog_content');
    dialog.appendChild(dialogContent);

    // montando o título
    const title = document.createElement('p');
    title.classList.add('dialog_title');
    title.innerHTML = dialogTitle;

    // montando o container da imagem
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('dialog_image_container');
    const image = document.createElement('img');
    const avatarImagePath = './utils/images/dialogAvatar.png';
    image.src = avatarImagePath;
    imageContainer.appendChild(image);

    // montando a descrição
    const description = document.createElement('p');
    description.classList.add('dialog_description');
    description.innerHTML = dialogDescription;

    // adicionando ao container de dialogo
    // titulo, imagem e botões
    dialogContent.appendChild(title);
    dialogContent.appendChild(imageContainer);
    dialogContent.appendChild(description);

    return dialog;
};