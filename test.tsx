const user = {
    name: 'Hedy Lamarr',
    imageURL: 'https://i.imgur.com/yXOvdOSs.jpg',
    imageSize: 90
}

export default function Profile(){
    return (
            <>
            <h1>{user.name}</h1><img
            className="avatar"
            src={user.imageURL}
            alt={'Photo of ' + user.name}
            style={{
                width: user.imageSize,
                height: user.imageSize
            }} />
            </>
    )
}