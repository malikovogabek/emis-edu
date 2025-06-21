import React from 'react'
import './Login.styles.css'
export default function Login() {
    return (
        // <div className="login">
        //     <h2 className='login__title'>Login</h2>

        //     <button >Login with One ID</button>
        // </div>
        <div className="flex w-full min-h-screen shadow-lg">
            <div className="flex-2 bg-blue-800 text-white p-10 flex flex-col justify-between w-2/3">
                <div className="flex items-center mb-12">
                    <img src={"https://tsuos.uz/wp-content/uploads/2021/09/oliy-talim-fan-va-innovatsiyalar-vazirligi-logo-01-01-1-1024x934.png"}
                        alt="O'zbekiston Respublikasi Oliy Ta'lim, Fan va Innovatsiyalar Vazirligi logosi"
                        className="h-10 mr-4 filter invert" />
                    <h1 className="text-3xl leading-tight font-medium">O'zbekiston Respublikasi Oliy Ta'lim, fan va innovatsiyalar vazirligi</h1>
                </div>
                <div className="flex-grow flex items-center justify-center">
                    <h2 className="text-5xl leading-tight  max-w-3xl pr-8">Akademik litseylarda ta'lim jarayonlarini boshqarish — EMIS</h2>
                </div>
            </div>

            <div className="flex-1 bg-white p-10 flex items-center justify-center w-1/3">
                <div className="text-center w-full max-w-sm">
                    <h3 className="text-3xl text-gray-800 mb-8 font-semibold">Tizimga kirish</h3>
                    <button className='' >
                        Login with One ID
                    </button>
                    <p className="text-sm m-3 text-gray-600 leading-relaxed">
                        O'zbekiston Respublikasi qonunchiligi asosida, shaxsiy ma'lumotlaringiz id.egov.uz tizimidan olinganini ma'lum qilamiz.
                    </p>
                </div>
            </div>
        </div>


    )
}
